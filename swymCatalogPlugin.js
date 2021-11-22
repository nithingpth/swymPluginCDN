function SwymCatalog(config) {
  let baseCatalogUrl = 'https://demo.swym.it';
  let productsPath = '/products';

  let defaultConfig = {
    container: '#swym-catalog-container',
    productSetMap: {
      '/page1': [0, 10],
      '/page2': [10, 20],
      noMatch: [0, 3],
    },
    visibleTileFields: ['title', 'price', 'image', 'vendor'],
    tileActions: {
      buyNow: function () {
        alert('added to cart');
      },
      viewNow: function () {
        window.open(event.target.getAttribute('link'));
      },
    },
    catalogSkin: '#00000000',
  };

  config = { ...defaultConfig, ...config };

  this.init = function () {
    //adding styles this way is not recommended
    this.addStyle(`
      ${config.container}{
        background-color: ${config.catalogSkin};
      }
      .tile {
        display: inline-block;
        margin: 10px;
        text-align: center;
      }
      .tile-image{
        height: 115px;
        width: 200px;
      }
      .tile-image img{
        height: 100%;
        width: 100%;
      }
      .tile-actions button{
        background: #8bc34a;
        border: none;
        border-radius: 5px;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
      }
    `);
    let container = document.querySelector(config.container);
    container = container ? container : document.body;
    let productRange = config.productSetMap[window.location.pathname]
      ? config.productSetMap[window.location.pathname]
      : config.productSetMap['noMatch'];

    this.fetchJson(productsPath).then((resp) => {
      //innerHtml usage is not recommended
      container.innerHTML = this.getTiles(resp.products, productRange);
      container.addEventListener('click', function (event) {
        if (event.target.classList.contains('tile-action-addtocart')) {
          config.tileActions.buyNow();
        }
        if (event.target.classList.contains('tile-action-viewnow')) {
          config.tileActions.viewNow();
        }
      });
    });
  };

  this.getTiles = function (productList, range) {
    let strTilesList = '';
    productList.forEach((product, index) => {
      if (index >= range[0] && index <= range[1]) {
        //building DOM via template strings is not recommended
        strTilesList += `<div class="tile">
                              <div class="tile-image"><img src="${
                                product.images[0].src.replace(".jpg","_300x300.jpg")
                              }"/></div>
                              <div class="tile-text">${product.title}</div>
                              ${
                                this.isFieldHidden('vendor')
                                  ? ''
                                  : `<div class="tile-text">${product.vendor}</div>`
                              }
                              <div class="tile-actions">
                                <button class="tile-action-addtocart">Add to cart</button>
                                <button class="tile-action-viewnow" link="${
                                  product.images[0].src
                                }">View Now</button>
                              </div>
                         </div>`;
      }
    });
    return strTilesList;
  };

  this.isFieldHidden = function (field) {
    return config.visibleTileFields.includes(field) ? false : true;
  };

  this.fetchJson = async function (path) {
    const response = await fetch(`${baseCatalogUrl}${path}.json`, {
      mode: 'no-cors',
      headers: new Headers({ 'content-type': 'application/json' }),
    });
    const json = await response.json();
    return json;
  };

  this.addStyle = function (styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
  };

  this.init();
}

// Example Usage:
// var mySwym = new SwymCatalog({
//   container: '#swym-catalog-container',
//   visibleTileFields: ['title', 'price', 'image'],
//   catalogSkin: 'red',
// })
