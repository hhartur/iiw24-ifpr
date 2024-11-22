let emails = [];
const ul = document.querySelector("ul");

//colocar email em html
fetch("./email.json")
  .then((data) => {
    if (data.ok) {
      return data.json();
    }
  })
  .then((result) => {
    emails = result.emails;
    emails.sort();

    emails.forEach((email) => {
      ul.innerHTML += `<li class="email"><a href="mailto:${email}" target="_blank">${email}</a></li>`;
    });
  });

//filtrar pesquisa

function filtrarEmail(e) {
  const pesquisa = e.target.value;

  if (pesquisa.trim().length == 0) {
    return;
  }
  const emailsFiltrados = emails.filter((email) => email.includes(pesquisa));
  ul.innerHTML = "";
  emailsFiltrados.forEach((emailFiltrado)=>{
    ul.innerHTML += `<li class="email"><a href="mailto:${emailFiltrado}" target="_blank">${emailFiltrado}</a></li>`;
  })
}

//limpar e voltar ao normal 

const pesquisa = document.getElementById("pesquisa");

pesquisa.addEventListener("input", (e)=>{
    if(!e.target.value){
        emails.forEach((email) => {
            ul.innerHTML += `<li class="email"><a href="mailto:${email}" target="_blank">${email}</a></li>`;
          });
    }
})