import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { authenticate } from "@modules/auth/presentation/middlewares/authenticate";
import { validateRequest } from "@modules/auth/presentation/middlewares/validateRequest";
import {
  createProductValidator,
  updateProductValidator,
  getProductsQueryValidator,
} from "@modules/products/infrastructure/validators/ProductValidators";

const router = Router();
const productController = new ProductController();

// All product routes require authentication
router.use(authenticate);

// Product CRUD
router.get(
  "/",
  getProductsQueryValidator,
  validateRequest,
  productController.getProducts
);

router.get("/:id", productController.getProductById);

router.post(
  "/",
  createProductValidator,
  //  validateRequest,
  productController.createProduct
);

router.patch(
  "/:id",
  updateProductValidator,
  validateRequest,
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);

// Product stats and team
router.get("/:id/stats", productController.getProductStats);
router.get("/:id/team", productController.getProductTeam);
router.post("/:id/team", productController.addTeamMember);
router.delete("/:id/team/:userId", productController.removeTeamMember);

export default router;
