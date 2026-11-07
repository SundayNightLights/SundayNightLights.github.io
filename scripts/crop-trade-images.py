#!/usr/bin/env python3
"""Create true-pixel transparent cutouts from the two original trade graphics.

Never synthesizes or replaces a face: this only generates per-pixel alpha from
the original assets, retaining the untouched source art in GitHub.
"""
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/"assets"

# Points are normalized to a 500 x 440 image and scaled to each original.
# The outer contour designates likely foreground for GrabCut; the inner
# contour marks confident player pixels.
SUBJECTS={
 "derek": {
   "outer": [(102,0),(261,0),(296,20),(301,67),(306,106),(297,149),
             (319,181),(345,189),(397,198),(463,223),(500,249),
             (500,440),(0,440),(0,314),(15,292),(24,252),(37,240),
             (49,229),(57,224),(61,242),(59,266),(73,279),(92,270),
             (107,245),(113,208),(113,176),(96,152),(97,111),(99,69)],
   "inner": [(145,24),(232,18),(269,50),(273,98),(253,147),(266,176),
             (305,218),(399,260),(445,341),(399,379),(160,380),
             (100,326),(154,259),(150,198),(145,135)],
   "fade_start": .64, "fade_end": .84
 },
 "alfred": {
   "outer": [(150,0),(307,0),(329,26),(335,60),(331,116),(320,152),
             (341,179),(388,191),(445,213),(500,257),(500,440),
             (0,440),(0,255),(48,224),(105,192),(138,174),(140,130)],
   "inner": [(186,26),(279,20),(301,61),(300,119),(274,167),(294,204),
             (370,242),(428,328),(401,388),(110,390),(83,292),
             (149,214),(168,151),(172,91)],
   "fade_start": .66, "fade_end": .85
 }
}

def scale_coords(points,w,h):
    return np.array([[(round(x*w/500),round(y*h/440)) for x,y in points]],dtype=np.int32)

def crop(name, opts):
    source=ASSETS/f"player-{name}.webp"
    original=Image.open(source).convert("RGBA")
    rgba=np.array(original)
    h,w=rgba.shape[:2]
    bgr=cv2.cvtColor(rgba[:,:,:3],cv2.COLOR_RGB2BGR)
    mask=np.full((h,w),cv2.GC_BGD,dtype=np.uint8)
    cv2.fillPoly(mask,scale_coords(opts["outer"],w,h),cv2.GC_PR_FGD)
    cv2.fillPoly(mask,scale_coords(opts["inner"],w,h),cv2.GC_FGD)
    bg_model=np.zeros((1,65),np.float64)
    fg_model=np.zeros((1,65),np.float64)
    cv2.grabCut(bgr,mask,None,bg_model,fg_model,8,cv2.GC_INIT_WITH_MASK)
    alpha=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # Eliminate isolated background islands and soften fine anti-aliased edges.
    count,labels,stats,_=cv2.connectedComponentsWithStats(alpha,8)
    if count>1:
        largest=np.argmax(stats[1:,cv2.CC_STAT_AREA])+1
        alpha=np.where(labels==largest,255,0).astype(np.uint8)
    # Remove leftover poster ink adjacent to the original subjects.
    hsv=cv2.cvtColor(bgr,cv2.COLOR_BGR2HSV)
    yy,xx=np.indices((h,w))
    if name=="alfred":
        # The old orange IHT banner sits left of the cap and shoulder.
        orange=(hsv[:,:,0]>=3)&(hsv[:,:,0]<=23)&(hsv[:,:,1]>145)
        unwanted=orange&(xx<w*.44)&(yy<h*.64)
        alpha[unwanted]=0
    else:
        # Remove white splatter behind Derek's raised finger and stray
        # high-contrast top-corner flecks without altering his face.
        whites=(hsv[:,:,1]<45)&(hsv[:,:,2]>190)
        unwanted=whites&(xx<w*.145)&(yy>h*.59)&(yy<h*.72)
        alpha[unwanted]=0
        alpha[(yy<h*.05)&(xx<w*.245)]=0
    # Hand-refine the likely poster fragments without altering either face.
    if name=="derek":
        # Loose ink near the cap and the pointing finger, plus white paper
        # accidentally selected beside the right cheek.
        alpha[(yy<h*.045)&(xx<w*.255)]=0
        fragment=(xx<w*.132)&(yy>h*.615)&(yy<h*.74)
        # Keep the raised hand's warm skin, discard dark, detached splatter.
        warm_skin=(hsv[:,:,0]>=4)&(hsv[:,:,0]<=24)&(hsv[:,:,1]>42)&(hsv[:,:,2]>78)
        alpha[fragment&(~warm_skin)]=0
        white_paper=(hsv[:,:,1]<36)&(hsv[:,:,2]>194)
        alpha[white_paper&(xx>w*.575)&(yy>h*.255)&(yy<h*.56)]=0
    else:
        # Keep all natural skin tones intact. The old poster is only
        # allowed to be rejected in the far-left margin outside the face.
        orange=(hsv[:,:,0]>=3)&(hsv[:,:,0]<=24)&(hsv[:,:,1]>133)&(hsv[:,:,2]>117)
        alpha[orange&(xx<w*.34)&(yy<h*.45)]=0

    # One-pixel erosion minimizes source-poster fringing on dark backgrounds.
    alpha=cv2.erode(alpha,np.ones((3,3),np.uint8),iterations=1)
    alpha=cv2.medianBlur(alpha,3)
    alpha=cv2.GaussianBlur(alpha,(3,3),.65)
    ys=np.arange(h,dtype=np.float32)[:,None]
    start=h*opts["fade_start"]
    end=h*opts["fade_end"]
    fade=np.clip((end-ys)/(end-start),0,1)
    if name=="derek":
        # Preserve the raised finger and hand left of the shirt lettering.
        left_fade=np.clip((h*.96-ys)/(h*.96-h*.82),0,1)
        hand_weight=np.clip((w*.37-xx)/(w*.37-w*.15),0,1)
        fade=left_fade*hand_weight+fade*(1-hand_weight)
    alpha=(alpha.astype(float)*fade).astype(np.uint8)
    rgba[:,:,3]=alpha
    output=ASSETS/f"trade-{name}-cutout.png"
    Image.fromarray(rgba,"RGBA").save(output,optimize=True)
    print(f"{name} alpha: min={alpha.min()}, max={alpha.max()}, opaque={(alpha==255).mean():.1%}, clear={(alpha==0).mean():.1%}, top_right={alpha[10,-10]}, top_left={alpha[10,10]}",flush=True)
    cutout=Image.fromarray(rgba,"RGBA")
    debug=Image.new("RGBA",original.size,(86,226,140,255))
    debug.alpha_composite(cutout)
    debug.convert("RGB").save(ASSETS/f"trade-{name}-cutout-preview.jpg",quality=90)

    # Article-style visual proof using the team's *real* logo asset.
    # The cutout itself stays an independent RGBA PNG.
    SIZE=600
    team="iht" if name=="derek" else "maul"
    base=(232,120,29,255) if team=="iht" else (17,20,25,255)
    canvas=Image.new("RGBA",(SIZE,SIZE),base)
    logo=Image.open(ASSETS/f"{team}.webp").convert("RGBA")
    logo.thumbnail((int(SIZE*1.48),int(SIZE*1.48)),Image.Resampling.LANCZOS)
    # Upscale the official mark beyond frame edges.
    scale=(SIZE*1.48)/max(logo.size)
    logo=logo.resize((int(logo.width*scale),int(logo.height*scale)),Image.Resampling.LANCZOS)
    logo_alpha=logo.getchannel("A").point(lambda v:int(v*.58))
    logo.putalpha(logo_alpha)
    canvas.alpha_composite(logo,((SIZE-logo.width)//2,(SIZE-logo.height)//2))
    person=cutout.resize((SIZE,SIZE),Image.Resampling.LANCZOS)
    canvas.alpha_composite(person)
    canvas.convert("RGB").save(ASSETS/f"trade-{name}-layout-preview.jpg",quality=92)
    print(f"Wrote {output}: {w}x{h}, with transparent background",flush=True)

for person,options in SUBJECTS.items():
    crop(person,options)
