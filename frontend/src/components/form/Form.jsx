function Form() {
    return (
        <form action="submit">
            <select name="selectSubject">
                <option value="Matemaatika">Matemaatika</option>
                {/* lisa koik ylejaanud */}
            </select>
            <select name="grade">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
            <input type="text" name="firstName" placeholder="Eesnimi" />
            <input type="text" name="lasName" placeholder="Perekonnanimi" />
        </form>
    )
}
export default Form