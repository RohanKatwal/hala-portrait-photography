#!/bin/bash
# Optimise source media (images/, video/) into site/assets for the web.
# Requires: cwebp (brew install webp), ffmpeg (brew install ffmpeg), python3 + Pillow, macOS qlmanage (video posters).
set -e
cd "$(dirname "$0")/.."
IMG=site/assets/img; VID=site/assets/video
mkdir -p "$IMG" "$VID"

# Photos: 640px thumbs + up-to-1600px full size, WebP
for f in images/*.jpeg; do
  id=$(basename "$f" .jpeg | sed 's/image000*//')
  [ -f "$IMG/$id-640.webp" ] || cwebp -quiet -q 78 -resize 640 0 -metadata none "$f" -o "$IMG/$id-640.webp"
  if [ ! -f "$IMG/$id-1600.webp" ]; then
    w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
    if [ "$w" -gt 1600 ]; then cwebp -quiet -q 82 -resize 1600 0 -metadata none "$f" -o "$IMG/$id-1600.webp"
    else cwebp -quiet -q 82 -metadata none "$f" -o "$IMG/$id-1600.webp"; fi
  fi
done

# Videos: copy with clean slugs + poster frames
copyvid () { # $1 = filename prefix, $2 = slug
  src=$(ls video/ | grep -F -- "$1" | head -1)
  # 720p H.264, moov atom first (+faststart) so browsers can start playing while streaming
  [ -f "$VID/$2.mp4" ] || ffmpeg -nostdin -loglevel error -i "video/$src" -vf "scale='min(720,iw)':-2" \
    -c:v libx264 -preset slow -crf 28 -maxrate 1300k -bufsize 2600k -pix_fmt yuv420p -profile:v high \
    -c:a aac -b:a 96k -ac 2 -movflags +faststart "$VID/$2.mp4"
  # smaller 480p copy, used by the player on phones / slow connections
  [ -f "$VID/$2-480.mp4" ] || ffmpeg -nostdin -loglevel error -i "video/$src" -vf "scale=480:-2" \
    -c:v libx264 -preset slow -crf 29 -maxrate 700k -bufsize 1400k -pix_fmt yuv420p \
    -c:a aac -b:a 80k -ac 2 -movflags +faststart "$VID/$2-480.mp4"
  if [ ! -f "$VID/$2.webp" ]; then
    tmp=$(mktemp -d); qlmanage -t -s 540 -o "$tmp" "video/$src" >/dev/null 2>&1
    cwebp -quiet -q 74 -resize 540 0 "$tmp"/*.png -o "$VID/$2.webp"; rm -rf "$tmp"
  fi
}
copyvid "Last project with this beautiful brand" tiyab-rourue
copyvid "Photoshoot for _h.a.y.z.o" hayzo-dubai
copyvid "Photoshoot inspired by the Nun" the-nun
copyvid "SOLD ❌__Wedding season" wedding-season
copyvid "SOLD ❌__Where heritage" heritage-couture
copyvid "Shop our luxury handpicked" kwetu-tiyab
copyvid "WEDDING EDITION" wedding-edition
copyvid "_hala.portrait.photography is doing" peony-perfume
copyvid "عزيز انت يا وطني" sudan-independence

# Social share image + dimensions manifest
python3 -E - <<'PY'
from PIL import Image; import os, json
src='images'; out={}
for f in sorted(os.listdir(src)):
    if not f.endswith('.jpeg'): continue
    i=Image.open(os.path.join(src,f)); out[str(int(f[5:10]))]=list(i.size)
json.dump(out, open('scripts/dimensions.json','w'))
im=Image.open('images/image00028.jpeg').convert('RGB')
w,h=im.size; t=int(w/1.91); y=int(h*0.12)
im.crop((0,y,w,y+t)).resize((1200,628)).save('site/assets/og.jpg',quality=82)
PY
du -sh "$IMG" "$VID"
