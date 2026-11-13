import os
import sys
import zipfile
import shutil
import subprocess
from PIL import Image, ImageDraw

def create_round_icon(img):
    # Create circular mask
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, img.size[0], img.size[1]), fill=255)
    round_img = Image.new('RGBA', img.size, (0, 0, 0, 0))
    round_img.paste(img, (0, 0), mask=mask)
    return round_img

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    apk_path = os.path.join(base_dir, 'TalliffyVanSalesPro-Debug.apk')
    icon_src_path = os.path.join(base_dir, 'mobile', 'assets', 'icon.png')

    if not os.path.exists(apk_path):
        print(f"Error: {apk_path} not found.")
        sys.exit(1)

    print("Opening source icon:", icon_src_path)
    src_icon = Image.open(icon_src_path).convert('RGBA')

    # Resolutions for mipmaps
    densities = {
        'res/mipmap-mdpi-v4': 48,
        'res/mipmap-hdpi-v4': 72,
        'res/mipmap-xhdpi-v4': 96,
        'res/mipmap-xxhdpi-v4': 144,
        'res/mipmap-xxxhdpi-v4': 192,
    }

    # Generate webp byte buffers
    webp_data = {}
    for folder, size in densities.items():
        resized = src_icon.resize((size, size), Image.Resampling.LANCZOS)
        round_resized = create_round_icon(resized)

        # Normal launcher
        normal_path = f"{folder}/ic_launcher.webp"
        round_path = f"{folder}/ic_launcher_round.webp"

        import io
        buf_normal = io.BytesIO()
        resized.save(buf_normal, format='WEBP')
        webp_data[normal_path] = buf_normal.getvalue()

        buf_round = io.BytesIO()
        round_resized.save(buf_round, format='WEBP')
        webp_data[round_path] = buf_round.getvalue()
        print(f"Prepared {normal_path} and {round_path} ({size}x{size})")

    # Read original APK and write new APK excluding old signature files
    temp_apk = os.path.join(base_dir, 'temp_unaligned.apk')
    print("Repackaging APK with updated icons...")

    with zipfile.ZipFile(apk_path, 'r') as zin:
        with zipfile.ZipFile(temp_apk, 'w') as zout:
            for item in zin.infolist():
                # Skip old signatures so apksigner can cleanly re-sign
                if item.filename.startswith('META-INF/') and (
                    item.filename.endswith('.SF') or
                    item.filename.endswith('.RSA') or
                    item.filename.endswith('.DSA') or
                    item.filename.endswith('.MF')
                ):
                    continue

                if item.filename in webp_data:
                    # Write updated icon
                    zout.writestr(item.filename, webp_data[item.filename], compress_type=zipfile.ZIP_DEFLATED)
                else:
                    # Copy existing file
                    zout.writestr(item, zin.read(item.filename))

    print("Zip packaging done. Aligning APK...")
    zipalign_exe = r"D:\Android\Sdk\build-tools\35.0.0\zipalign.exe"
    aligned_apk = os.path.join(base_dir, 'temp_aligned.apk')
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)

    subprocess.check_call([zipalign_exe, "-p", "-f", "4", temp_apk, aligned_apk])
    os.remove(temp_apk)

    print("Signing APK with debug keystore...")
    apksigner_bat = r"D:\Android\Sdk\build-tools\35.0.0\apksigner.bat"
    keystore_path = os.path.expanduser(r"~\.android\debug.keystore")

    env = os.environ.copy()
    env["JAVA_HOME"] = r"D:\Android\android-studio\jbr"
    env["PATH"] = rf"D:\Android\android-studio\jbr\bin;{env.get('PATH', '')}"

    subprocess.check_call([
        apksigner_bat, "sign",
        "--ks", keystore_path,
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        aligned_apk
    ], env=env)

    # Replace original APK
    shutil.move(aligned_apk, apk_path)
    print("Successfully patched and signed:", apk_path)

    # Also update copies in webapp/public and webapp/dist
    for dest in [
        os.path.join(base_dir, 'TalliffyVanSalesPro-Release.apk'),
        os.path.join(base_dir, 'webapp', 'public', 'TalliffyVanSalesPro.apk'),
        os.path.join(base_dir, 'webapp', 'dist', 'TalliffyVanSalesPro.apk'),
    ]:
        if os.path.exists(os.path.dirname(dest)):
            shutil.copy2(apk_path, dest)
            print("Copied to:", dest)

if __name__ == '__main__':
    main()
