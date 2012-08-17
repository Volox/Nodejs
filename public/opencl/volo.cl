
// Keypoints refinement
#define lowContrastThreshold 0.03f
#define Rth 10.0f

// Keypoints detection
#define KEYPOINT_GOOD 255.0f
#define KEYPOINT_BAD 0.0f

// Magniture Orientation related
#define windowSize 7
#define binSize 36
#define gapSize (360/binSize) // 360/binSize

uint _i( uint x, uint y, uint w, uint h ) {
  //if( x<0 ) x=0;
  if( x>w-1 ) x=w-1;
  
  //if( y<0 ) y=0;
  if( y>h-1 ) y=h-1;
  return y*w+x;
}

// Subpixel precision
float _sPx( __global const float* image, uint x, uint y, uint w, uint h ) {
  // D + D' + D''
  return image[ _i(x,y,w,h) ];
}

__kernel void clMagOrient( __global const float* image,
                           __global const float* keyPoints,
                           __global float* magnitude,
                           __global float* orientation,
                           uint width,
                           uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  float value = keyPoints[ idx ];

  if( value!=0 ) {

    // Create anc init to 0 orientation histogram
    float orHist[ binSize ];
    for ( uchar i=0; i<binSize; i++ )
      orHist[i] = 0;
    
    float maxPeak = 0;
    float maxOrient = 0;
    uchar maxPeakPos = 0;

    for( char ox=-windowSize/2; ox<=windowSize/2; ox++ ) {
      for( char oy=-windowSize/2; oy<=windowSize/2; oy++ ) {
        uint cx = x+ox;
        uint cy = y+oy;
        float LNx = image[ _i(cx+1,cy,width,height) ];
        float LPx = image[ _i(cx-1,cy,width,height) ];
        float LNy = image[ _i(cx,cy+1,width,height) ];
        float LPy = image[ _i(cx,cy-1,width,height) ];

        // Calculate Magnitude and Orientation
        float mag = sqrt( pown(LNx-LPx,2) + pown(LNy-LPy,2) );
        float orient = atan( (LNy-LPy)/(LNx-LPx) );

        // Normalize degree
        uint degr = (uint) fmod(degrees(orient)+360,360); 
        uchar bin = (uchar) floor( degr/gapSize );
        orHist[ bin ] += mag;

        maxPeak = max( maxPeak, orHist[ bin ] );
        if( maxPeak==orHist[bin] )
          maxPeakPos = bin;
      }
    }

    // Find the bins with 80% or more of the highest peak
    // TODO extend to multiple bins
    
    /*
    for ( uchar i=0; i<36; i++ ) {
      if( orHist[i]>maxPeak*0.8 ) {
        // Good bin
      }
    }
    */
    magnitude[ idx ] = orHist[ maxPeakPos ];
    orientation[ idx ] = gapSize*maxPeakPos+gapSize/2;
  } else {
    magnitude[ idx ] = KEYPOINT_BAD;
    orientation[ idx ] = KEYPOINT_BAD;
  }
}

__kernel void clRefine( __global const float* image,
                        __global const float* keyPoints,
                        __global float* keyPointsRefined,
                        uint width,
                        uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  
  float value = _sPx( image, x, y, width, height );

  if( keyPoints[ idx ]!=KEYPOINT_BAD && value>lowContrastThreshold ) {
    float NxValue = _sPx( image, x+1, y, width, height );
    float PxValue = _sPx( image, x-1, y, width, height );
    float NyValue = _sPx( image, x, y+1, width, height );
    float PyValue = _sPx( image, x, y-1, width, height );
    float NxyValue = _sPx( image, x+1, y+1, width, height );
    float PxyValue = _sPx( image, x-1, y-1, width, height );
    float NxPyValue = _sPx( image, x+1, y-1, width, height );
    float PxNyValue = _sPx( image, x-1, y+1, width, height );
    

    float deltaX = 1;
    float deltaY = 1;
    float delta = 1;
    

    // Derivatives
    float Dx = (NxValue-PxValue)/deltaX;
    float Dxx = (NxValue-2*value+PxValue)/pown(deltaX,2);
    float Dyy = (NyValue-2*value+PyValue)/pown(deltaY,2);;
    float Dxy = (NxyValue+PxyValue-NxPyValue-PxNyValue)/delta;
    
    // Hessian trace and determinant
    float Tr = Dxx + Dyy;
    float Det = Dxx*Dyy-pown(Dxy,2);
    
    float R = pown(Tr,2)/Det;
    float rThreshold = pown(Rth+1,2)/Rth;

    if( R>rThreshold ) {
      // Reject keypoint
      keyPointsRefined[ idx ] = KEYPOINT_BAD;
    } else {
      keyPointsRefined[ idx ] = KEYPOINT_GOOD;
    }
  } else {
    keyPointsRefined[ idx ] = KEYPOINT_BAD;
  }
}

__kernel void clMaxMin( __global const float* prev,
                        __global const float* current,
                        __global const float* next,
                        __global float* keyPoints,
                        uint width,
                        uint height ) {
  uint x = get_global_id(0);
  uint y = get_global_id(1);

  if (x >= width || y >= height) return;

  // Get the current pixel index
  uint idx = y*width+x;
  
  float value = current[ idx ];

  // Init max & min
  float max = value;
  float min = value;

  // Iterate over the neighbours
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
    
  if( value==max || value==min ) {
    keyPoints[idx] = KEYPOINT_GOOD;
  } else {
    keyPoints[idx] = KEYPOINT_BAD;
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
  // check for good values for "fitting"
  if( max>min ) {
    float range = max-min;

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