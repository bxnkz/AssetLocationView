import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import FloorImage from "./components/FloorImage";
import AssetImage from "./components/AssetImage";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
// import ProductList from "./components";
import { Stage, Layer } from "react-konva";

interface User {
  name: string;
}

interface AssetType {
  name: string;
  x: number;
  y: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [selectedFloor, setSelectedFloor] = useState("FL1");
  const [placedAssets, setPlacedAssets] = useState<AssetType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const FRONTEND_URL = "https://ratiphong.tips.co.th:5173";

  // เช็ค Authentication
  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        const response = await axios.get<User>(
          "https://ratiphong.tips.co.th:7112/api/User/Profile",
          { withCredentials: true }
        );

        if (isMounted && response.data?.name) {
          setUser(response.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    checkAuthentication();
    return () => {
      isMounted = false;
    };
  }, []);

  // redirect ถ้าไม่ได้ login
  useEffect(() => {
    if (!loggingOut && authChecked && !user) {
      window.location.href = `https://intranet.tips.co.th/ssocore/login?ReturnUrl=${encodeURIComponent(
        FRONTEND_URL
      )}`;
    }
  }, [authChecked, user, loggingOut]);

  const handleLogout = () => {
    setLoggingOut(true);
    window.location.href = `https://intranet.tips.co.th/ssocore/logout?ReturnUrl=${encodeURIComponent(
      FRONTEND_URL
    )}`;
  };

  const getImageSrc = () => {
    switch (selectedFloor) {
      case "FL1":
        return "/img/TIPS_B4_FL1.png";
      case "FL2":
        return "/img/TIPS_B4_FL2.png";
      case "FL3_1":
        return "/img/TIPS_B4_FL3-1.png";
      case "FL3_2":
        return "/img/TIPS_B4_FL3-2.png";
      case "FL4":
        return "/img/TIPS_B4_FL4.png";
      default:
        return "/img/TIPS_B4_FL1.png";
    }
  };

  const handleDragEnd = (name: string, x: number, y: number) => {
    setPlacedAssets((prev) => {
      const exist = prev.find((a) => a.name === name);
      if (exist) {
        return prev.map((a) => (a.name === name ? { name, x, y } : a));
      } else {
        return [...prev, { name, x, y }];
      }
    });
  };

  const handleAddAsset = (name: string) => {
    setPlacedAssets((prev) => [...prev, { name, x: 50, y: 50 }]);
  };

  if (loading) return <div>Loading...</div>;
  if (!user && !loggingOut) return <div>Redirect to Log in...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar
        name={user?.name || ""}
        onLogout={handleLogout}
        selectedFloor={selectedFloor}
        onFloorChange={setSelectedFloor}
      />
      {/* <ProductList/> */}
      {/* Main content */}
      <main className="flex-1 p-4 flex justify-center items-start relative">
        <Stage width={800} height={600}>
          <Layer>
            <FloorImage src={getImageSrc()} />
            {placedAssets.map((asset) => (
              <AssetImage
                key={asset.name + asset.x + asset.y}
                name={asset.name}
                x={asset.x}
                y={asset.y}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Layer>
        </Stage>

        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onAddAsset={handleAddAsset}
        />
      </main>

      {/* Floating button ขวาล่าง */}
      <FloatingButton onClick={() => setSidebarOpen(true)} />
    </div>
  );
}

export default App;