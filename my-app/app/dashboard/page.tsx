// import defined functions from another file

export default function Home() {
    const managerFunc = () => {
        console.log("clicked");
    };
    return (
        <main>
        <div>
            <h1 style={{color:'white', marginTop:60}}>welcome to the manager's dashboard</h1>
            <p>hello</p>
            {/* <button onClick={managerFunc}>Try clicking me to print to console</button> */}
        </div>
        </main>
    )
}