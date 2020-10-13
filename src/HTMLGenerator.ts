export interface HTMLGeneratorProps {
  dataSource: string;
  libPath?: string;
}

export function HTMLGenerator(props: HTMLGeneratorProps) {
  const { dataSource, libPath = 'lib' } = props
  return (
    `<!DOCTYPE html>
    <html>
        <head>
            <title>SCO local endpoint</title>
            <meta charset="UTF-8"/>
            <script>var exports = {};</script>
            <script type="text/javascript" src="${libPath}/SCORMAdapter.js"></script>
            <script type="text/javascript" src="${libPath}/MessageHandler.js"></script>
            <script type="text/javascript" src="${libPath}/loadContent.js"></script>
            <style type="text/css">
                html, body { margin: 0; padding:0; overflow:hidden; width: 100%; height: 100%; }
                body {
                    font-size: 20px;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    color: #1d1046;
                }
                #wrapper { display: flex; flex-direction: column; height: 100%; }
                .container { width: 80%; max-width: 1200px; padding: 15px; margin: auto; }
                #wrapper .header {
                    padding-top: 20px; padding-bottom: 20px;
                    background-color: #f3f4f5;
                }
                #wrapper .messages { flex-grow: 1; padding-top: 20px; padding-bottom: 20px; }
                #wrapper .messages p { color: red; }
                #title-error-messages { color: #1d1046; }
                #wrapper .footer {
                    background-color: #1d1046; color: white;
                    padding-top: 10px; padding-bottom: 10px;
                }
                #wrapper .footer a { color: white; }

                iframe { overflow: hidden; height: 100%; width: 100%; }
                iframe + #wrapper { display: none; }
                #runtime-error {
                    position: fixed;
                    left: 20px; bottom: 20px; padding: 15px;
                    background-color: #f44a3d; color: white;
                    font-size: 16px;
                }
                #runtime-error h6, #runtime-error p { margin: 0 0 10px;}
                #runtime-error p:last-child { margin: 0;}
                #runtime-error:empty { display: none; }
            </style>
        </head>
        <!-- Set the body's data-source attribute to the SCO's remote endpoint. -->
        <body onload="loadContent();" data-source="${dataSource}">
            <div id="wrapper">
                <div class="header"><div class="container">
                    <h1 id="title">Your content is loading...</h1>
                    <p id="subtitle">Please wait, or if your content doesn't appear, try closing and opening this window again.</p>
                </div></div>
                <div class="messages container">
                    <h2 id="title-error-messages">If the initialization fails, error messages will appear below:</h2>
                </div>
                <div class="footer"><div class="container" id="footer-content">
                    This content is loaded via <a href="https://github.com/Didask/scol-r" target="_blank">SCOL-R</a>, a cross-domain SCORM connector created by <a href="https://www.didask.com" target="_blank">Didask</a>.
                </div></div>
            </div>
            <div id="runtime-error"></div>
        </body>
    </html>`
  )
}
