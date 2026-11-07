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
   "fade_start": .73, "fade_end": .95
 },
 "alfred": {
   "outer": [(150,0),(307,0),(329,26),(335,60),(331,116),(320,152),
             (341,179),(388,191),(445,213),(500,257),(500,440),
             (0,440),(0,255),(48,224),(105,192),(138,174),(140,130)],
   "inner": [(186,26),(279,20),(301,61),(300,119),(274,167),(294,204),
             (370,242),(428,328),(401,388),(110,390),(83,292),
             (149,214),(168,151),(172,91)],
   "fade_start": .76, "fade_end": .97
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
    alpha=cv2.medianBlur(alpha,3)
    alpha=cv2.GaussianBlur(alpha,(3,3),.7)
    ys=np.arange(h,dtype=np.float32)[:,None]
    start=h*opts["fade_start"]
    end=h*opts["fade_end"]
    fade=np.clip((end-ys)/(end-start),0,1)
    alpha=(alpha.astype(float)*fade).astype(np.uint8)
    rgba[:,:,3]=alpha
    output=ASSETS/f"trade-{name}-cutout.png"
    Image.fromarray(rgba,"RGBA").save(output,optimize=True)
    print(f"Wrote {output}: {w}x{h}, with transparent background",flush=True)

for person,options in SUBJECTS.items():
    crop(person,options)
