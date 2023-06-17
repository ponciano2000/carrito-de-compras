//Accedemos a los elementos del template
//y al div donde vamos a colocar el template.
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};
console.log(document.getElementById('template-card').content)

//Con el siguiente código hacemos que una vez que se termine
//de cargat el HTML, llamamos a la función fetchData.
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    //Para que no se borre el carrito si catualizamos la página
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
    }
    pintarCarrito();
});

//Para poder detectar el botón 
cards.addEventListener('click', e => {
    addCarrito(e);
})

//Para detectar el botón de sumar y restar

items.addEventListener('click', e => {
    btnAccion(e);
});


//Llamamos los datos de las tarjetas del json
const fetchData = async () => {
    try {
        const res = await fetch('api.json');
        const data = await res.json();
        pintarCards(data);
        
    } catch (error) {
        console.log(error)
    }
};

//Creamos una funcioón para pintar las cards
const pintarCards = (data) => {
    data.forEach( productos => {
        templateCard.querySelector('h5').textContent = productos.title;
        templateCard.querySelector('p').textContent = productos.precio;
        //Para hacer de manera dinámica el src de la imágen en el template usamos setAttribute('')
        templateCard.querySelector('img').setAttribute('src', productos.thumbnailUrl);
        templateCard.querySelector('.btn-dark').dataset.id = productos.id;
        const clone =templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
}

const addCarrito = e => {
    //Con la siguiente línea estamos haciendo que reconozca el botón
    if (e.target.classList.contains('btn-dark')) {
        setCarrito(e.target.parentElement);

    }
    e.stopPropagation();
};

const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-dark').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
        
    }
    if (carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    carrito[producto.id] = {...producto};
    pintarCarrito();
};

const pintarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });
    items.appendChild(fragment);

    pintarFooter();

    //Indicamos que guarde el carrito en el local storage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

const pintarFooter = () => {
    footer.innerHTML = '';
    if(Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`;
        return;
    }

    const nCantidad = Object.values(carrito).reduce( (acumulador, {cantidad}) => acumulador + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce( (acumulador, {cantidad, precio}) => acumulador + cantidad*precio, 0);

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById('vaciar-carrito');
    btnVaciar.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    })
};

const btnAccion = e => {
    //Acción de aumentar
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = {...producto};
        pintarCarrito();
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;

        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        pintarCarrito();
    }

    e.stopPropagation();
};