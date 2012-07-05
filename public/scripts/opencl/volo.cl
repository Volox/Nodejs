__kernel void clMaxMin( __global const uchar4* prev,
                        __global const uchar4* current,
                        __global const uchar4* next,
                        __global uchar4* maxKeyPoints,
                        __global uchar4* minKeyPoints,
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
  bool isMax = true;
  bool isMin = true;


  // Iterate over the neighbours
  for( char ox=-1; ox<1; ox++ && ( isMin || isMax ) ) {
    int cx = x+ox;
    // Check x coordinate
    if( cx<0 || cx>width-1 )
      continue;

    for( char oy=-1; oy<1; oy++ && ( isMin || isMax ) ) {
      // Check y coordinate
      int cy = y+oy;
      if( cy<0 || cy>height-1 )
        continue;

      // Compute offset index
      uint currentIdx = cy*width+cx;

      // Check prev image
      uchar prevColor = prev[ currentIdx ].x;
      isMax = isMax && ( max( prevColor, color )==color );
      isMin = isMin && ( min( prevColor, color )==color );

      // Check current image
      if( cx!=x || cy!=y ) {
        uchar currentColor = current[ currentIdx ].x;
        isMax = isMax && ( max( currentColor, color )==color );
        isMin = isMin && ( min( currentColor, color )==color );
      }

      // Check next image
      uchar nextColor = prev[ currentIdx ].x;
      isMax = isMax && ( max( nextColor, color )==color );
      isMin = isMin && ( min( nextColor, color )==color );
    }
  }

  if( isMax )
    maxKeyPoints[ idx ] = (uchar4)(255,0,0,255); // Red
  if( isMin )
    minKeyPoints[ idx ] = (uchar4)(0,255,0,255); // Green
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