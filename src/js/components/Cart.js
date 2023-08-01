import { select, settings, classNames, templates } from '../settings.js';
import CartProduct from './CartProducts.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom = {
      wrapper: element,
      toggleTrigger: element.querySelector(select.cart.toggleTrigger),
      productList: element.querySelector(select.cart.productList),
      deliveryFee: element.querySelector(select.cart.deliveryFee),
      subtotalPrice: element.querySelector(select.cart.subtotalPrice),
      totalPrice: element.querySelectorAll(select.cart.totalPrice),
      totalNumber: element.querySelector(select.cart.totalNumber),
      form: element.querySelector(select.cart.form),
      phone: element.querySelector(select.cart.phone),
      address: element.querySelector(select.cart.address),
    };
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }

  update() {
    const thisCart = this;

    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      subtotalPrice += product.price;
      totalNumber += product.amount;
    }

    if (totalNumber === 0) {
      thisCart.deliveryFee = 0;
    } else {
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    }

    thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;

    for (let totalPriceElem of thisCart.dom.totalPrice) {
      totalPriceElem.innerHTML = thisCart.totalPrice;
    }

    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;
  }

  remove(event) {
    const thisCart = this;
    console.log('event: ', event);

    event.dom.wrapper.remove();

    /* check where product is in array */
    const productToRemove = thisCart.products.indexOf(event);
    /* Remove product */
    thisCart.products.splice(productToRemove, 1);

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;

    const phone = thisCart.dom.phone.value;
    const address = thisCart.dom.address.value;

    const totalPrice = thisCart.totalPrice;
    const subtotalPrice = thisCart.subtotalPrice;
    const totalNumber = thisCart.totalNumber;
    const deliveryFee = thisCart.deliveryFee;

    const payload = {
      phone,
      address,
      totalPrice,
      subtotalPrice,
      totalNumber,
      deliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const url = settings.db.url + '/' + settings.db.orders;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;
