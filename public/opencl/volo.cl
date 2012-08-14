__kernel void clMaxMin( __global const float* keyPoints,
                        __global float* keyPointsRefined,
                        uint width,
                        uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  float value = keyPoints[ idx ];

  if( value!=0 ) {
    float vP = (y+1)*width+(x+1);
    float vPP = (y+2)*width+(x+2);
    float Dx = keyPoints[] + value;
    float Dxx = value;
    float Dxy = value;
    float Dyy = value;
    
    float Tr = Dxx + Dyy;
    float Det = Dxx*Dyy-pown(Dxy,2);
    float R = pown(Tr,2)/Det;

    keyPointsRefined[ idx ] = R;
  } else {
    keyPointsRefined[ idx ] = 0;
  }
}

__kernel void clMaxMin( __global const float* prev,
                        __global const float* current,
                        __global const float* next,
                        __global float* keyPoints,
                        float threshold,
                        uint width,
                        uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  float value = current[ idx ];

  float tmpValue = value;
  if( tmpValue<0 )
    tmpValue = -1*value;

  // Init max & min
  float max = value;
  float min = value;

  // Iterate over the neighbours
  if( tmpValue>threshold ) {
    for( char ox=-1; ox<=1; ox++ ) {
      uint cx = x+ox;
      if( cx<0 || cx>width-1 ) {
        continue;
      }
      for( char oy=-1; oy<=1; oy++ ) {
        uint cy = y+oy;
        if( cy<0 || cy>height-1 ) {
          continue;
        }
        uint currentIdx = cy*width+cx;

        // Values
        float prevValue = prev[ currentIdx ];
        float currValue = current[ currentIdx ];
        float nextValue = next[ currentIdx ];


        // Check prev
        if( prevValue>max )
          max = prevValue;
        if( prevValue<min )
          min = prevValue;

        // Check current
        if( cx!=x && cy!=y ) {
          if( currValue>max )
            max = currValue;
          if( currValue<min )
            min = currValue;
        }

        // Check next
        if( nextValue>max )
          max = nextValue;
        if( nextValue<min )
          min = nextValue;


      }
    }
    
  }

  if( value==max || value==min ) {
    keyPoints[idx] = 255;
  } else {
    keyPoints[idx] = 0;
  }
}


__kernel void clFloat( __global const uchar4* src,
                      __global float* dst,
                      uint width,
                      uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);
  if (x >= width || y >= height) return;

  uint idx = y*width+x;
  float r = (float) src[idx].x;
  float g = (float) src[idx].y;
  float b = (float) src[idx].z;

  dst[idx] = 0.3f*r + 0.59f*g + 0.11f*b;
}
__kernel void clRGB( __global const float* src,
                      __global uchar4* dst,
                      uint width,
                      uint height,
                      float min,
                      float max ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);
  if (x >= width || y >= height) return;

  uint idx = y*width+x;

  float newVal = src[idx];
  // Good values for "fitting"
  if( max>min ) {
    float range = max-min;
    // x:255=newVal:range
    // x = 255*newVal/range

    newVal = smoothstep( min, max, newVal )*255;
  }

  uchar lum = (uchar) newVal;
  
  dst[idx] = (uchar4)(lum,lum,lum,255);
}


__kernel void clDiff( __global const float* src1,
                      __global const float* src2,
                      __global float* dst,
                      uint width,
                      uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);
  if (x >= width || y >= height) return;

  uint idx = y*width+x;

  dst[idx] = src2[ idx ] - src1[ idx ];
}
                             

__kernel void clConvolution( __global const float* src,
                      __global const float* filter,
                      __global float* dst,
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
      //uint filterIdx = yF*fW+xF;
      uint filterIdx = (fH-1-yF)*fW+(fW-1-xF);

      val += filter[filterIdx] * src[idx];
    }
  }
  
  uint idx = y*width+x;

  dst[idx] = val;
}