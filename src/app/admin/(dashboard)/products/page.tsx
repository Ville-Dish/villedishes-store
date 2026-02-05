import { ProductList } from "@/components/custom/products/product-list";
import { requireAuth } from "@/lib/session/server-session";

const AdminProductsPage = async () => {
  await requireAuth();
  return <ProductList />;
};

export default AdminProductsPage;
