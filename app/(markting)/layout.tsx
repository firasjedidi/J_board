import { Footer } from "./_components/footer";
import { NavBar } from "./_components/navbar";
const MarktingLayout = ({children}:{children:React.ReactNode}) => {
    return (
        <div className="h-full bg-slate-100">
            <NavBar/>
            <main className="pt-20 pb-20 bg-slate-100">
                {children}
            </main>
            <Footer/> 
        </div>
    );
}

export default MarktingLayout;