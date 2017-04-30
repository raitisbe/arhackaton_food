## Food around me

## Inspiration
I wanted to make a 3D visualization of a point of interest database which was another project of mine. AR seemed a good way to do it.

## What it does
It shows restaurants or other points of interest around my location as an augmented reality overlay over a video from phones or tablets webcam. Also a previously prepared road network can be loaded from common geographic data file (geoJSON) and displayed over the video.

## How I built it
Application was build completely using JavaScript and Three.Js. For parsing and converting GeoJSON data to 3D world coordinates https://github.com/jdomingu/ThreeGeoJSON library was used, which was modified to suit my needs - read properties of points not only coordinates, display the POIs as beer bottles instead of 2D particles etc.

## Challenges I ran into
Sensor readings where inconsistent between devices. Overlay of 3 layers needed to be made: video, threejs canvas, 2d canvas for point labels. Phone orientation changes and mapping phone rotation to 3D world needed to be made. Wobbly lines close to the user needed to be fixed, which was done partly using Kalman filter and camera smoothing.

## Accomplishments that I'm proud of
It just runs which is accomplishment enough for me.

## What I learned
Implemented Kalman filter to correct the sensor values. 

## What's next for Food around me
Make the location dynamically set from users phone GPS. More points of interest and more 
