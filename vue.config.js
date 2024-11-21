// // vue.config.js
// module.exports = {
//     // Cấu hình Webpack
//     chainWebpack: config => {
//         // Cấu hình HtmlWebpackPlugin cho popup.html
//         config.plugin('html').use(require('html-webpack-plugin'), [
//             {
//                 template: 'index.html',  // Đường dẫn tới template HTML của bạn
//                 filename: 'index.html',  // Tên file HTML xuất ra trong thư mục dist
//                 inject: {
//                     // Tự động chèn các thẻ script cho JS và link cho CSS
//                     // js: ['assets/[name].[contenthash].js'], // Cấu hình đường dẫn tới các file JS đã được băm
//                     js: ['assets/[name]-[contenthash].js'], // Cấu hình đường dẫn tới các file JS đã được băm
//                 },
//             },
//         ]);
//     },
//
//     // Cấu hình build output (có thể thay đổi nếu cần)
//     outputDir: 'dist',  // Thư mục xuất build (mặc định là 'dist')
//     assetsDir: 'assets',  // Thư mục chứa các file tĩnh (css, js, hình ảnh, ...)
//
//     // Các cấu hình khác có thể cần
//     configureWebpack: {
//         output: {
//             filename: 'assets/[name].[contenthash].js',  // Tên file JS với hash
//             chunkFilename: 'assets/[name].[contenthash].js',  // Tên file chunk với hash
//         },
//     },
// };
