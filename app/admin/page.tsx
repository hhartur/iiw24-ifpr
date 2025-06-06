export default function AdminPage(){
    return (
        <div>
            <h1>Admin</h1>
            <form method="dialog">
                <input type="text" name="username" id="username" placeholder="Username" />
                <input type="password" name="password" id="password" placeholder="Password" />
                <input type="submit" value={"Entrar"} />
            </form>
            {/*<div className="alert">ola mundo</div>*/}
        </div>
    )
}