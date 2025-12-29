# Idle Slayer Roulette predictor

** Prerequisites:**
- Common
  - Node.js

- Ubuntu packages
  ```sudo apt update
     sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev```

- Arch based distro packages
  ```sudo pacman -Syu
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg \
    libvips```

- RHEL based distro
  ```sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libappindicator-gtk3-devel \
    librsvg2-devel```

1. Install dependencies:
   `npm install`
2. Install and init tauri
   ```npm install -D @tauri-apps/cli
      npx tauri init```
2. Run the app:
   `npm run dev`
3. Build:
   `npm run tauri build`
