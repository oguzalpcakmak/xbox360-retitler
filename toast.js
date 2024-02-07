/* https://codepen.io/Coding-in-Public/pen/ZEaKENX */

let toastContainer;

const generateToast = ({
  message,
  background = "#00214d",
  color = "#fffffe",
  length = "3000ms",
}) => {
  toastContainer.insertAdjacentHTML(
    "beforeend",
    `<p class="toast" 
    style="background-color: ${background};
    color: ${color};
    animation-duration: ${length}">
    ${message}
  </p>`
  );
  const toast = toastContainer.lastElementChild;
  toast.addEventListener("animationend", () => toast.remove());
};

const initToast = () => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div class="toast-container"></div>
  <style>
  
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  display: grid;
  justify-items: end;
  gap: 1.5rem;
}

.toast {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  padding: 0.5em 1em;
  background-color: lightblue;
  animation: toastIt 3000ms cubic-bezier(0.785, 0.135, 0.15, 0.86) forwards;
}

@keyframes toastIt {
  0%,
  100% {
    transform: translateY(-150%);
    opacity: 0;
  }
  10%,
  90% {
    transform: translateY(0);
    opacity: 1;
  }
}
  </style>
  `
  );
  toastContainer = document.querySelector(".toast-container");
};
