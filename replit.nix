{ pkgs }: {
  deps = [
    pkgs.nodejs
    pkgs.nodePackages.npm
    pkgs.ffmpeg
    pkgs.imagemagick
    pkgs.git
  ];
}
