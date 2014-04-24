function cleartexts() {

document.getElementById('txt').value = "";
document.getElementById('trad').value = "";

} 

function disableval(valor)
{
        var checkboxvalen = document.getElementById("valen");

        if (valor == "ca-es")
        {
        checkboxvalen.disabled=true;
        }
        else
        {
        checkboxvalen.disabled=false;
        }
}
