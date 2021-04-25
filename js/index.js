class View {
  constructor(api) {
    this.app = document.getElementById("app");
    this.api = api;
    this.searchLine = this.createElement("div", "search-line");
    this.searchInput = this.createElement("input", "search-input");
    this.searchLine.append(this.searchInput);
    this.repoList = this.createElement("ul", "search-repo");
    this.main = this.createElement("div", "main");
    this.main.append(this.searchLine);
    this.main.append(this.repoList);
    this.app.append(this.main);
  }

  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag);
    if (elementClass) {
      element.classList.add(elementClass);
    }
    return element;
  }

  createRepo(repo) {
    const repoElement = this.createElement("li", "search-repo-element");
    repoElement.addEventListener("click", () => {
      this.showRepoData(repo);
    });
    repoElement.innerHTML = `<a href="#" class="repo-prev-name">${repo.name}</a>`;
    this.repoList.append(repoElement);
  }

  showRepoData(repo) {
    const repoInfo = this.createElement("div", "repo-info");
    const repoInfoList = this.createElement("ul", "repo-info-list");
    const btn = this.createElement("button", "closebtn");
    repoInfoList.innerHTML = `<li class="repo-info-element">name: ${repo.name}
                              <li class="repo-info-element">owner: ${repo.owner.login}</li>
                              <li class="repo-info-element">stars: ${repo.stargazers_count}</li>`;
    this.main.append(repoInfo);
    repoInfo.append(repoInfoList);
    repoInfo.append(btn);
    btn.onclick = () => repoInfo.remove();
  }
}

class Search {
  constructor(view, api) {
    this.view = view;
    this.api = api;
    this.view.searchInput.addEventListener(
      "keyup",
      this.debounce(this.searchRepos.bind(this), 500)
    );
  }

  searchRepos() {
    if (this.view.searchInput.value) {
      this.reposRequest(this.view.searchInput.value);
    } else {
      this.clearRepos();
    }
  }

  async reposRequest(searchValue) {
    let totalCount;
    let repos;
    try {
      await this.api.searchRepos(searchValue).then((res) => {
        res.json().then((res) => {
          repos = res.items;
          totalCount = res.total_count;
          if (totalCount > 5) {
            this.clearRepos();
          }
          repos.forEach((repo) => this.view.createRepo(repo));
        });
      });
    } catch (e) {
      console.log("Error: " + e);
    }
  }

  clearRepos() {
    this.view.repoList.innerHTML = "";
  }

  debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  }
}
const URL = "https://api.github.com/";

class Api {
  constructor() {}
  async searchRepos(value) {
    return await fetch(
      `${URL}search/repositories?q=${value}&sort=stars&order=desc&per_page=5`
    );
  }
}

const api = new Api();
const app = new Search(new View(api), api);
