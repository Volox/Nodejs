__kernel void clMaxMin( __global const uchar4* images,
                        __global uchar4* keyPoints,
                        uint width,
                        uint height ) {
  /*
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  uchar4 prevImage = images[0];
  uchar4 image = images[1];
  uchar4 nextImage = images[2];

  uint idx = y*width+x;
  // Using only r channel (grayscale image)
  uchar point = ((uchar4) image[idx]).x;

  uchar maxVal = point;
  uchar minVal = point;
  for (uint i=-1; i<2; i++ ) {
    for (uint j=-1; j<2; j++ ) {
      uint nX = x+i;
      uint nY = y+j;

      uint currentIdx = nY*width+nX;
      maxVal = max( ((uchar4) prevImage[ currentIdx ] ).x, maxVal );
      minVal = min( ((uchar4) prevImage[ currentIdx ] ).x, minVal );

      maxVal = max( ((uchar4) image[ currentIdx ] ).x, maxVal );
      minVal = min( ((uchar4) image[ currentIdx ] ).x, minVal );

      maxVal = max( ((uchar4) nextImage[ currentIdx ] ).x, maxVal );
      minVal = min( ((uchar4) nextImage[ currentIdx ] ).x, minVal );
    }
  }

  if( maxVal!=point || minVal!=point )
    keyPoints[ idx ] = (uchar4)(255,0,0,255)
  */
}

__kernel void clDiff( __global const uchar4* src1,
                      __global const uchar4* src2,
                      __global uchar4* dst,
                      uint width,
                      uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);
  if (x >= width || y >= height) return;

  uint idx = y*width+x;
  uchar r = clamp( src1[idx].x-src2[idx].x, 0, 255 );
  uchar g = clamp( src1[idx].y-src2[idx].y, 0, 255 );
  uchar b = clamp( src1[idx].z-src2[idx].z, 0, 255 );

  dst[idx] = (uchar4)(r,g,b,255);
}
                             

__kernel void clConvolution( __global const uchar4* src,
                      __global const float* filter,
                      __global uchar4* dst,
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

  uchar blurVal = (uchar) val;

  dst[idx] = (uchar4)(blurVal,blurVal,blurVal,255);
}