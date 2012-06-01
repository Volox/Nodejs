__kernel void clVolo( __global const uchar4* src,
                      __global const float* filter,
                      __global uchar4* dst,
                      __global float* fOut,
                      uint width,
                      uint height,
                      uint fW,
                      uint fH) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);
  if (x >= width || y >= height) return;

  float val = 0;
  for(int xF=0; xF<fW; xF++) {
    for(int yF=0; yF<fH; yF++) {
      int cx = (x+xF);
      int cy = (y+yF);

      if(cx>=width) cx=width-1;
      if(cy>=height) cy=height-1;
      
      uint idx = cy*width+cx;
      uint filterIdx = yF*fW+xF;

      uchar4 color = src[idx];
      uchar r = color.x;
      uchar g = color.y;
      uchar b = color.z;

      uchar lum = 0.3f*r + 0.59f*g + 0.11f*b;

      float filterVal = filter[filterIdx];
      val += filterVal*lum;
    }
  }
  
  uint idx = y*width+x;
  fOut[idx] = val;

  uchar blurVal = (uchar) val;

  dst[idx] = (uchar4)(blurVal,blurVal,blurVal,255);
}