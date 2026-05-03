import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Subtle Mesh Gradients for "Pop" */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 blur-[120px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 left-64 w-[400px] h-[400px] bg-blue-200/20 blur-[100px] -z-10 rounded-full"></div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col relative pl-64">
        <Header />
        <main className="flex-1 p-10 overflow-y-auto z-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
