export default function(resourceRoot: string, proxyUrl = '') {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <base href="${resourceRoot}">
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser</title>
    <link rel="stylesheet" type="text/css" href="index.css" />
    <script>
    window.proxyUrl = '${proxyUrl}';
    </script>
    <script src="awesomplete.min.js"></script>
    <link rel="stylesheet" href="awesomplete.min.css" />
  </head>
  <body>

    <div class="page">
      <div class="header">
        <div id="backward" class="button">
          <svg class="icon" width="100%" height="100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M390.56937 805.977451c12.489452-12.489452 12.489452-32.737612 0-45.227064L182.895517 527.011902H943.264211c17.662265 0 31.980365-14.3181 31.980365-31.980365s-14.3181-31.980365-31.980365-31.980366H182.895517L390.56937 229.312686c12.489452-12.489452 12.489452-32.737612 0-45.227064-12.489452-12.489452-32.737612-12.489452-45.227064 0L89.162716 472.418516a31.833009 31.833009 0 0 0-6.402827 9.147334 31.963992 31.963992 0 0 0-2.963495 13.465687c0 8.184403 3.122107 16.368806 9.367345 22.614043l256.17959 288.331871c12.488429 12.489452 32.736589 12.489452 45.226041 0z" /></svg>
        </div>
        <div id="forward" class="button">
          <svg class="icon" width="100%" height="100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M664.4716 805.977451c-12.489452-12.489452-12.489452-32.737612 0-45.227064l207.673853-233.738485H111.776759c-17.662265 0-31.980365-14.3181-31.980365-31.980365s14.3181-31.980365 31.980365-31.980366h760.368694L664.4716 229.312686c-12.489452-12.489452-12.489452-32.737612 0-45.227064 12.489452-12.489452 32.737612-12.489452 45.227064 0l256.179591 288.331871a31.833009 31.833009 0 0 1 6.402826 9.147334 31.963992 31.963992 0 0 1 2.963495 13.465686c0 8.184403-3.122107 16.368806-9.367345 22.614044L709.698664 805.977451c-12.489452 12.489452-32.738635 12.489452-45.227064 0z" /></svg>
        </div>
        <div id="refresh" class="button">
          <svg class="icon" width="100%" height="100%" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="M929.536 208c-17.664 0-32 14.336-32 32l0 45.024C819.712 152.896 676.448 64 512 64 264.576 64 64 264.576 64 512s200.576 448 448 448c149.728 0 281.6-73.952 362.88-186.816 0.256-0.256 0.416-0.544 0.64-0.8 0.992-1.408 2.208-2.656 3.2-4.064-0.128-0.064-0.192-0.16-0.32-0.224 3.52-5.184 6.08-11.072 6.08-17.792 0.032-17.856-14.432-32.288-32.224-32.288-12.608 0-23.264 7.424-28.576 17.984l-0.224 0c-69.728 96.768-183.072 160-311.456 160C299.936 896 128 724.064 128 512S299.936 128 512 128c148.544 0 276.832 84.608 340.672 208l-51.136 0c-17.664 0-32 14.336-32 32s14.336 32 32 32l128 0c17.664 0 32-14.336 32-32l0-128C961.536 222.336 947.2 208 929.536 208z" /></svg>
        </div>
        <form id="search">
          <input id="address" name="address" />
        </form>
        <div id="fold"></div>
      </div>
      <iframe id="iframe" frameborder="no" border="0" marginwidth="0" marginheight="0" allowtransparency="yes"></iframe>
    </div>

    <script src="index.js"></script>
  </body>
  </html>`
};
