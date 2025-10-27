# Anime Avatarify

Turn your photos into anime-style portraits using AnimeGANv2 right in your browser!

## Features

- Upload any portrait photo
- Convert to anime style using AnimeGANv2
- Multiple style options available:
  - face_paint_512_v2 (best for portraits)
  - celeba_distill (more stylized anime look)
  - paprika (Paprika anime movie style)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

## Model Setup

The app uses the AnimeGANv2 model converted to TensorFlow.js format. By default, it loads from a CDN for development. For production use:

1. Download the model files:
```bash
# Create model directory
mkdir -p public/models/animegan

# Download the face_paint_512_v2 model (recommended for portraits)
curl -L https://huggingface.co/bryandlee/animegan2-pytorch/resolve/main/face_paint_512_v2.onnx -o public/models/animegan/face_paint_512_v2.onnx
```

2. Convert ONNX to TFJS format:
```bash
# Install converter
pip install tensorflowjs

# Convert model
tensorflowjs_converter \
  --input_format=onnx \
  --output_format=tfjs_graph_model \
  public/models/animegan/face_paint_512_v2.onnx \
  public/models/animegan/face_paint_512_v2
```

## Credits

- Models from [bryandlee/animegan2-pytorch](https://github.com/bryandlee/animegan2-pytorch)
- Built with React + Vite
