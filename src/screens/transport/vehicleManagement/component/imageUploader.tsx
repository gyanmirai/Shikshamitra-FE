import React, { useRef, useState } from 'react';

import { Box, Menu, Button, MenuItem } from '@mui/material';

const ImageUploadAndMarker = () => {
  const [image, setImage] = useState(null);
  const [markerColor, setMarkerColor] = useState('red');
  const [anchorEl, setAnchorEl] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (color: any) => {
    setMarkerColor(color);
    setAnchorEl(null);
  };

  const drawCircle = (x: any, y: any) => {
    const canvas = canvasRef.current;
    // @ts-ignore
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleClick = (e: any) => {
    // @ts-ignore
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    drawCircle(x, y);
  };

  return (
    <Box>
      <input
        accept="image/*"
        type="file"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="upload-image"
      />

      {/* <label htmlFor="upload-image">
                <Button variant="contained" component="span">
                    Upload Image
                </Button>
            </label> */}

      {image && (
        <Box position="relative">
          <img
            ref={imageRef}
            src={image}
            alt="Uploaded"
            style={{ width: '100%', height: 'auto' }}
          />
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 'auto',
              cursor: 'crosshair',
            }}
          />
        </Box>
      )}

      <Button onClick={(e) => {}} variant="outlined" style={{ marginTop: '10px' }}>
        Select Marker Color
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {['red', 'blue', 'green', 'yellow'].map((color) => (
          <MenuItem
            key={color}
            onClick={() => handleColorSelect(color)}
            style={{ backgroundColor: color, color: '#fff' }}
          >
            {color}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ImageUploadAndMarker;
