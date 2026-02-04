import { ProductList } from "@/components/custom/products/product-list";
import { getAuthSession } from "@/lib/session/server-session";

const AdminProductsPage = async () => {
  await getAuthSession();
  return <ProductList />;
};

export default AdminProductsPage;
