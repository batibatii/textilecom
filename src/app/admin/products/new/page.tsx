import { CreateNewProduct } from "@/components/CreateNewProduct";
import { AdminNavbar } from "@/components/AdminNav";

export default function CreateNewProductPage() {
  return (
    <>
      <AdminNavbar></AdminNavbar>
      <main className="min-h-dvh flex justify-center items-center">
        <CreateNewProduct></CreateNewProduct>
      </main>
    </>
  );
}
