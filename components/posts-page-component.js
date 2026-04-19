import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage } from "../index.js";
import { getPosts, toggleLike } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  console.log("Актуальный список постов:", posts);

 
  const getToken = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return user.token ? `Bearer ${user.token}` : null;
  };

 
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} секунд назад`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} минут назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} часов назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дней назад`;
    return date.toLocaleDateString();
  }

  
  let postsHtml = '';
  
  if (posts && posts.length > 0) {
    for (const post of posts) {
      const isLiked = post.isLiked;
      const likeIconSrc = isLiked 
        ? './assets/images/like-active.svg' 
        : './assets/images/like-not-active.svg';
      
      postsHtml += `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image" alt="avatar">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}" alt="post image">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="${likeIconSrc}">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
          </p>
          <p class="post-date">
            ${formatDate(post.createdAt)}
          </p>
        </li>
      `;
    }
  } else {
    postsHtml = '<div style="text-align: center; padding: 40px;">Нет постов. Добавьте первый пост!</div>';
  }

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

 
  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }


  for (let likeButton of document.querySelectorAll(".like-button")) {
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      
      const postId = likeButton.dataset.postId;
      const token = getToken();
      
      console.log("Токен для лайка:", token ? "есть" : "нет");
      
      if (!token) {
        alert("Авторизуйтесь, чтобы ставить лайки");
        return;
      }
      
      toggleLike({ token, postId })
        .then(() => {
          return getPosts({ token });
        })
        .then((newPosts) => {
         
          posts.length = 0;
          posts.push(...newPosts);
      
          renderPostsPageComponent({ appEl });
        })
        .catch((error) => {
          console.error("Ошибка при лайке:", error);
          alert("Не удалось поставить лайк");
        });
    });
  }
}