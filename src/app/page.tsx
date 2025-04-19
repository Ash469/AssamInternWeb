import  Home from "./Home";
export default function Page() {
  return (<>
    <Home />
    <footer className="bg-gray-800 text-white py-4 text-center">
      <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
    </footer>
  </>
  );
}
