import { getPosts, createPost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { showNotification } from "./components/notification-component.js";

export let user = getUserFromLocalStorage();
window.user = user; 

export let page = null;
export let posts = [];

const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  window.user = null;
  removeUserFromLocalStorage();
  showNotification("👋 Вы вышли из аккаунта");
  goToPage(POSTS_PAGE);
};


export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      
      if (!user) {
        showNotification("🔒 Авторизуйтесь, чтобы добавить пост", true);
      }
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          showNotification("❌ Не удалось загрузить посты", true);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      console.log("Открываю страницу пользователя: ", data.userId);
      page = LOADING_PAGE;
      renderApp();
      
     
      const token = getToken();
      const userId = data.userId;
      
      fetch(`https://wedev-api.sky.pro/api/v1/prod/instapro/user-posts/${userId}`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      })
        .then((response) => {
          if (response.status === 401) {
            throw new Error("Нет авторизации");
          }
          return response.json();
        })
        .then((data) => {
          page = USER_POSTS_PAGE;
          posts = data.posts || [];
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          showNotification("❌ Не удалось загрузить посты пользователя", true);
          page = POSTS_PAGE;
          renderApp();
        });
      
      return;
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        window.user = newUser;
        saveUserToLocalStorage(user);
        showNotification(`🎉 Добро пожаловать, ${newUser.name || newUser.login}!`);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        console.log("Добавляю пост...", { description, imageUrl });
        
        createPost({
          token: getToken(),
          description: description,
          imageUrl: imageUrl,
        })
        .then(() => {
          showNotification("✅ Пост успешно добавлен!");
          goToPage(POSTS_PAGE);
        })
        .catch((error) => {
          console.error("Ошибка при добавлении поста:", error);
          showNotification("❌ Не удалось добавить пост. Попробуйте ещё раз.", true);
        });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }
};

goToPage(POSTS_PAGE);
