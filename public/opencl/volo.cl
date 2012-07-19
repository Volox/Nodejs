__kernel void clMaxMin( __global const uchar4* prev,
                        __global const uchar4* current,
                        __global const uchar4* next,
                        __global uchar4* keyPoints,
                        uchar threshold,
                        uint width,
                        uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  // Get the current pixel color
  // Same color for every channel so we use only R channel
  uchar color = current[ idx ].x;

  // Init max & min
  bool isMaxMin = true;

  if( color<threshold )
    isMaxMin = false;

  // Iterate over the neighbours
  for( char ox=-1; ox<1; ox++ && isMaxMin ) {
    int cx = x+ox;
    // Check x coordinate
    if( cx<0 || cx>width-1 )
      continue;

    for( char oy=-1; oy<1; oy++ && isMaxMin ) {
      // Check y coordinate
      int cy = y+oy;
      if( cy<0 || cy>height-1 )
        continue;

      // Compute offset index
      uint currentIdx = cy*width+cx;

      // Check prev image
      uchar prevColor = prev[ currentIdx ].x;
      if( prevColor>color || prevColor<color )
        isMaxMin = false;

      // Check current image
      if( cx!=x && cy!=y ) {
        uchar currentColor = current[ currentIdx ].x;
        if( currentColor>color || currentColor<color )
          isMaxMin = false;
      }

      // Check next image
      uchar nextColor = prev[ currentIdx ].x;
      if( nextColor>color || nextColor<color )
        isMaxMin = false;
    }
  }

  if( isMaxMin )
    keyPoints[ idx ] = (uchar4)(255,255,255,255); // White = Keypoint
  else
    keyPoints[ idx ] = (uchar4)(0,0,0,255); // Black = No keypoint
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