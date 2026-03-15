// HTML 生成服务 - 生成独立运行的 HTML 文件

export interface ProjectForExport {
  name: string;
  pages: Array<{
    id: string;
    name: string;
    html: string;
  }>;
}

export function generateStandaloneHTML(project: ProjectForExport): string {
  // Build pages HTML
  let pagesHtml = '';
  project.pages.forEach((page) => {
    pagesHtml += '\n    <!-- Page: ' + page.name + ' -->\n';
    pagesHtml += '    <div class="page" data-page-id="' + page.id + '">\n';
    pagesHtml += '      ' + page.html + '\n';
    pagesHtml += '    </div>\n';
  });

  // Build complete HTML document
  let html = '<!DOCTYPE html>\n';
  html += '<html lang="zh-CN">\n';
  html += '<head>\n';
  html += '  <meta charset="UTF-8">\n';
  html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += '  <title>' + project.name + '</title>\n';
  html += '  <style>\n';
  html += '    /* Reset & Base Styles */\n';
  html += '    * {\n';
  html += '      margin: 0;\n';
  html += '      padding: 0;\n';
  html += '      box-sizing: border-box;\n';
  html += '    }\n';
  html += '\n';
  html += '    body {\n';
  html += '      font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif;\n';
  html += '      line-height: 1.6;\n';
  html += '      color: #333;\n';
  html += '      background: #f5f5f5;\n';
  html += '    }\n';
  html += '\n';
  html += '    /* Page Container */\n';
  html += '    .page {\n';
  html += '      min-height: 100vh;\n';
  html += '      padding: 20px;\n';
  html += '      background: white;\n';
  html += '    }\n';
  html += '\n';
  html += '    /* Responsive Images */\n';
  html += '    img {\n';
  html += '      max-width: 100%;\n';
  html += '      height: auto;\n';
  html += '      display: block;\n';
  html += '    }\n';
  html += '\n';
  html += '    /* Responsive Videos */\n';
  html += '    video, iframe {\n';
  html += '      max-width: 100%;\n';
  html += '      height: auto;\n';
  html += '    }\n';
  html += '  </style>\n';
  html += '</head>\n';
  html += '<body>\n';
  html += '  ' + pagesHtml + '\n';
  html += '  <script>\n';
  html += '    document.addEventListener(\'DOMContentLoaded\', function() {\n';
  html += '      console.log(\'' + project.name + ' 已加载\');\n';
  html += '    });\n';
  html += '  </script>\n';
  html += '</body>\n';
  html += '</html>';

  return html;
}
