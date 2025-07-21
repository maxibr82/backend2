import ProductService from './services/ProductService.js';
const productService = new ProductService();

export default (io) => {
    io.on("connection", (socket) => {

        socket.on("createProduct", async (data) => {
            try {
                await productService.createProduct(data);
                const result = await productService.getAllProducts({});
                const products = result.docs || result.payload || [];
                socket.emit("publishProducts", products);
            } catch (error) {
                socket.emit("statusError", error.message);
            }
        });

        socket.on("deleteProduct", async (data) => {
            try {
                const result = await productService.deleteProduct(data.pid);
                const productsResult = await productService.getAllProducts({});
                const products = productsResult.docs || productsResult.payload || [];
                socket.emit("publishProducts", products);
            } catch (error) {
                socket.emit("statusError", error.message);
            }
        });
    });
}