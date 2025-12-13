import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { checkRole } from "@modules/auth/presentation/middlewares/checkRole";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createProductValidator,
  updateProductValidator,
} from "@modules/products/infrastructure/validators/ProductValidators";

const router = Router();
const productController = new ProductController();

// All routes require authentication
router.use(authenticate);

// Public read access (all authenticated users)
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Create: Admin + Moderator
router.post(
  "/",
  checkRole("admin", "moderator"),
  createProductValidator,
  validateRequest,
  productController.createProduct
);

// Update: Admin + Moderator
router.patch(
  "/:id",
  checkRole("admin", "moderator"),
  updateProductValidator,
  validateRequest,
  productController.updateProduct
);

// Delete: Admin only
router.delete("/:id", checkRole("admin"), productController.deleteProduct);

export default router;
