// import React, { useEffect, useState } from "react";
// import axios from "axios";
// // import './App.css';
// import '../index.css';

// interface Product {
//   prodCode: string;
//   prodName: string;
//   prodDesc: string;
// }

// const ProductList: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get<Product[]>(
//           "https://ratiphong.tips.co.th:7112/api/Product/type/1",
//           { withCredentials: true }
//         );
//         setProducts(response.data);
//         setError("");
//       } catch (err) {
//         if (axios.isAxiosError(err)) {
//           setError(
//             err.response?.data?.message ||
//             `Error fetching products: ${err.message}`
//           );
//         } else {
//           setError("Unexpected error occurred");
//         }
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (loading) return <div>Loading Product .....</div>;
//   if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Product List (Type 1)</h2>
//       <p>Found {products.length} products</p>
//       {products.length === 0 ? (
//         <p>No products found</p>
//       ) : (
//         <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
//           {products.map((product) => (
//             <li key={product.prodCode} style={{ marginBottom: "10px" }}>
//               <div><strong>Code:</strong> {product.prodCode || "N/A"}</div>
//               <div><strong>Name:</strong> {product.prodName || "N/A"}</div>
//               <div><strong>Description:</strong> {product.prodDesc || "N/A"}</div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ProductList;
