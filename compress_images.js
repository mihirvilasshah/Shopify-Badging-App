var compress_images = require('compress-images');

const INPUT_path_to_your_images = 'src/img/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
const OUTPUT_path = 'build/img/';

compress_images(INPUT_path_to_your_images, OUTPUT_path, { compress_force: false, statistic: true, autoupdate: true }, false,
    { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
    { png: { engine: 'webp', command: ['-q', '60'] } }, //png -> webp
    { svg: { engine: 'svgo', command: '--multipass' } },
    { gif: { engine: 'gif2webp', command: ['-f', '80', '-mixed', '-q', '30', '-m', '2'] } }, function () { }  //gif -> webp
);