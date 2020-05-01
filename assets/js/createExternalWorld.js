function createExternalWorld() {
    const h2Element = document.createElement('h2');
    h2Element.innerHTML = 'Content loaded via External Script';
    document.body.appendChild(h2Element);
}

createExternalWorld();