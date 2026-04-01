# Visualizer for iRacing .ibt telemetry

### It is a work in progress. Currently, it has only a few scripts.

## Scripts

### compress_samples.js

It selects only the fastest lap (with minimal number of ticks) and stores the data we need:
- SessionTick: tick number,
- LapDist: completed lap distance in meters,
- Lat: the car's latitude, 
- Lon: teh car's longitude, 
- LapBestLap: best clean lap (can be -1 of no clean laps were completed), 
- Lap: lap number, 
- Speed: speed in m/s,

### view_samples.js

It selects only 4 full samples to view all available tick data.
Selected tick numbers are `1`, `10`, `n/2`, `n` throughought the whole session,

### parse_track_coordinates.js

It parses the string of coordinates into the JSON array of Lon/Lat coordinates.
