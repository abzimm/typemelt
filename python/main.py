# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fontTools.ttLib import TTFont
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FONT_1_PATH = "SourceSans3-Regular.ttf"
FONT_2_PATH = "SourceSans3-Bold.ttf"

class InterpolationParams(BaseModel):
    t: float

@app.post("/interpolate")
def interpolate_font(params: InterpolationParams):
    try:
        font1 = TTFont(FONT_1_PATH)
        font2 = TTFont(FONT_2_PATH)
        
        # Get A glyph from both fonts
        glyph1 = font1['glyf']['A']
        glyph2 = font2['glyf']['A']
        
        # Get coordinates and contour endpoints
        coordinates1 = np.array(glyph1.coordinates)
        coordinates2 = np.array(glyph2.coordinates)
        contours1 = glyph1.endPtsOfContours
        
        # Interpolate coordinates
        t = (params.t + 1) / 2  # Convert -1:1 to 0:1
        interpolated = coordinates1 * (1-t) + coordinates2 * t
        
        return {
            "value": params.t,
            "coordinates": interpolated.tolist(),
            "contours": contours1,
            "flags": [bool(f & 0x01) for f in glyph1.flags]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))