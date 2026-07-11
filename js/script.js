/* ==========================================================================
   UJJWAL AGARWAL — PORTFOLIO
   Modular JS architecture. Every feature module is wrapped by safeInit()
   so a failure in one module can never block the others from loading.
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   Shared helpers
   -------------------------------------------------------------------------- */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

function safeInit(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`[portfolio] "${name}" failed to initialize:`, err);
  }
}

function $(selector, scope = document) {
  return scope.querySelector(selector);
}
function $all(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/* --------------------------------------------------------------------------
   Icon registry — Simple Icons CDN + hand-drawn fallbacks for concepts
   that have no brand mark (GitOps, Observability, CI/CD as a practice).
   Reused by initSkills() and initHeroVisual().
   -------------------------------------------------------------------------- */
const ICONS = {
  linux: "linux.svg",
  bash: "bash.svg",
  python: "python.svg",
  git: "git.svg",
  github: "github.svg",
  docker: "docker.svg",
  aws: "aws.svg",
  terraform: "terraform.svg",
  jenkins: "jenkins.svg",
  gitlab: "gitlab.svg",
  kubernetes: "kubernetes.svg",
  ansible: "ansible.svg",
  prometheus: "prometheus.svg",
  grafana: "grafana.svg",
  argocd: "argocd.svg",
};


function renderIcon(key, size = 28) {

  if (!ICONS[key]) return '';

  return `
    <img
      src="assets/icons/${ICONS[key]}"
      alt="${key}"
      width="${size}"
      height="${size}"
      loading="lazy"
      decoding="async"
      class="tech-icon">
  `;
}

/* ==========================================================================
   1. LOADER
   ========================================================================== */
function initLoader() {
  const loader = $('#loader');
  const body = $('#loaderBody');
  const lastLogin = $('#loaderLastLogin');
  if (!loader || !body) return;

  document.body.classList.add('is-locked');

  if (lastLogin) {
    lastLogin.textContent = `Last login: ${new Date().toString().replace(/GMT.*/, '').trim()} on ttys000`;
  }

  const finish = () => {
    loader.classList.add('is-shrinking');
    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
    }, 550);
  };

  // Safety net: never let the loader trap the user, motion or not
  window.setTimeout(finish, 6500);

  if (prefersReducedMotion) {
    finish();
    return;
  }

  // Preserved verbatim: the original boot-sequence copy
  const bootSequence = [
    { text: '$ whoami', type: 'prompt' },
    { text: 'ujjwal_agarwal', type: 'result' },
    { text: '$ role --current', type: 'prompt' },
    { text: 'DevOps & Cloud Enthusiast', type: 'result' },
    { text: '$ ./boot_portfolio.sh', type: 'prompt' },
    { text: 'Loading UI..............', type: 'ok' },
    { text: 'Loading Skills..........', type: 'ok' },
    { text: 'Loading Projects........', type: 'ok' },
    { text: 'Connecting AWS..........', type: 'ok' },
    { text: 'Portfolio Ready.', type: 'ready' },
  ];

  let i = 0;
  const nextLine = () => {
    if (i >= bootSequence.length) {
      window.setTimeout(finish, 500);
      return;
    }
    const item = bootSequence[i];
    const el = document.createElement('p');
    el.className = `line line--${item.type}`;
    el.textContent = item.text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    i++;
    window.setTimeout(nextLine, item.type === 'ok' ? 260 : 380);
  };
  window.setTimeout(nextLine, 400);
}

/** Placeholder hrefs ("#") shouldn't jump-scroll the page to the top. */
function initPlaceholderLinkGuard() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
}

/* ==========================================================================
   2. NAVIGATION
   ========================================================================== */
function initNav() {
  const nav = $('#nav');
  const burger = $('#navBurger');
  const links = $('#navLinks');
  if (!nav) return;

  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    $all('a', links).forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }

  const navLinkEls = $all('.nav__link[href^="#"]');
  const sections = navLinkEls
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const byId = new Map(navLinkEls.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = byId.get(entry.target.id);
          if (!link) return;
          if (entry.isIntersecting) {
            navLinkEls.forEach((a) => a.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }
}

/* ==========================================================================
   3. SCROLL PROGRESS + CURSOR GLOW + BACK TO TOP
   ========================================================================== */
function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = `${max > 0 ? (scrolled / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initCursorGlow() {
  if (isTouchDevice || prefersReducedMotion) return;
  const glow = $('#cursorGlow');
  if (!glow) return;
  let raf = null;
  window.addEventListener('pointermove', (e) => {
    glow.classList.add('is-active');
    if (raf) return;
    raf = requestAnimationFrame(() => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
}

function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  const toggle = () => btn.classList.toggle('is-visible', window.scrollY > 700);
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
  toggle();
}

/* ==========================================================================
   4. GENERIC SCROLL-REVEAL (IntersectionObserver)
   ========================================================================== */
function initRevealObserver() {
  const targets = $all('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    targets.forEach((t) => t.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  targets.forEach((t) => io.observe(t));

  const sections = $all('section');
  if (sections.length && 'IntersectionObserver' in window) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    sections.forEach((s) => sectionIO.observe(s));
  }
}

/* ==========================================================================
   5. HERO — typed role, ambient particles, DevOps infrastructure visual
   ========================================================================== */
function initHeroTypedRole() {
  const el = $('#heroTypedRole');
  if (!el) return;
  // Preserved verbatim from the original hero copy
  const roles = ['· AWS Cloud', '· Docker & Kubernetes', '· Terraform', '· Jenkins', '· CI/CD', '· Cloud Native', '· GitOps', '· DevSecOps'];

  if (prefersReducedMotion) {
    el.textContent = roles[0];
    return;
  }

  let roleIndex = 0, charIndex = 0, deleting = false;
  const cursor = document.createElement('span');
  cursor.className = 'hero__cursor';
  cursor.textContent = '|';
  cursor.setAttribute('aria-hidden', 'true');
  const textNode = document.createElement('span');
  el.textContent = '';
  el.append(textNode, cursor);

  const tick = () => {
    const current = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      textNode.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        window.setTimeout(tick, 1600);
        return;
      }
    } else {
      charIndex--;
      textNode.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    window.setTimeout(tick, deleting ? 40 : 70);
  };
  tick();
}

function initHeroParticles() {
  const field = $('#heroParticles');
  if (!field || prefersReducedMotion) return;
  const count = window.innerWidth < 640 ? 12 : 24;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.bottom = `${Math.random() * -20}%`;
    p.style.animationDuration = `${10 + Math.random() * 14}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    p.style.opacity = String(0.3 + Math.random() * 0.4);
    frag.appendChild(p);
  }
  field.appendChild(frag);
}

/** The signature hero element: a DevOps pipeline topology diagram —
 *  code flows through CI, gets containerized, orchestrated, and provisioned
 *  to the cloud. Nodes use real brand icons; connectors pulse to suggest
 *  a live deployment flow. Mouse parallax is subtle and fully optional. */
function initHeroVisual() {
  const root = $('#heroVisual');
  if (!root) return;

  $all('[data-icon]', root).forEach((holder) => {
    const key = holder.dataset.icon;
    const markup = renderIcon(key, holder.dataset.iconSize ? Number(holder.dataset.iconSize) : 26);
    if (markup) holder.innerHTML = markup;
  });

  if (prefersReducedMotion) {
    root.classList.add('is-static');
    return;
  }

  if (!isTouchDevice) {
    let raf = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    const onMove = (e) => {
      const rect = root.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = Math.max(-1, Math.min(1, relX)) * 6;
      targetY = Math.max(-1, Math.min(1, relY)) * 6;
      if (!raf) raf = requestAnimationFrame(render);
    };
    const render = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      root.style.setProperty('--tiltX', `${-curY.toFixed(2)}deg`);
      root.style.setProperty('--tiltY', `${curX.toFixed(2)}deg`);
      if (Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02) {
        raf = requestAnimationFrame(render);
      } else {
        raf = null;
      }
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', () => {
      targetX = 0; targetY = 0;
      if (!raf) raf = requestAnimationFrame(render);
    });
  }

  const nodes = $all('.hero__node', root);
  const paths = $all('.hero__flow-path', root);
  nodes.forEach((node) => {
    const key = node.dataset.node;
    const setActive = (active) => {
      paths.forEach((p) => {
        if (p.dataset.from === key || p.dataset.to === key) {
          p.classList.toggle('is-active', active);
        }
      });
      node.classList.toggle('is-active', active);
    };
    node.addEventListener('mouseenter', () => setActive(true));
    node.addEventListener('mouseleave', () => setActive(false));
  });
}

function initHero() {
  initHeroTypedRole();
  initHeroParticles();
  initHeroVisual();
}

/* ==========================================================================
   6. JOURNEY / STAIRCASE
   ========================================================================== */
function initJourney() {
  const staircase = $('#staircase');
  if (!staircase) return;
  const fill = $('.staircase__fill', staircase);
  const climber = $('.staircase__climber', staircase);
  const stairs = $all('.stair', staircase);
  if (!stairs.length) return;

  const update = () => {
    const rect = staircase.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = rect.height;
    const scrolledPast = vh * 0.75 - rect.top;
    const progress = Math.max(0, Math.min(1, scrolledPast / total));

    if (fill) fill.style.height = `${progress * 100}%`;
    if (climber) climber.style.top = `${progress * 100}%`;

    stairs.forEach((stair) => {
      const stairRect = stair.getBoundingClientRect();
      const stairMid = stairRect.top + stairRect.height / 2;
      stair.classList.toggle('is-passed', stairMid < vh * 0.75);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ==========================================================================
   7. SKILLS
   DATA + STATE
   ========================================================================== */

function initSkills() {


  const ui={
  categories:$("#skillsCategories"),
  skills:$("#skillsList"),
  icon:$("#skillIcon"),
  title:$("#skillTitle"),
  category:$("#skillCategory"),
  role:$("#skillRole"),
  concepts:$("#skillConcepts"),
  useCases:$("#skillUseCases"),
  related:$("#skillRelated"),
  workflow:$("#skillWorkflow"),
  card:$("#skillsCard"),
  section:$("#skills")
};

if(!ui.categories||!ui.skills||!ui.card)return;


  /* ------------------------------------------------------------------------
     Application State
  ------------------------------------------------------------------------ */

 const state={
  categories:[],
  currentCategory:0,
  currentSkill:0,
  paused:false,
  manual:false,
  timer:null,
  delay:2000
};

function getCategories(){

  const map={};

  Object.entries(skillsData).forEach(([key,skill])=>{

    if(!map[skill.category])
      map[skill.category]=[];

    map[skill.category].push(key);

  });

  return Object.entries(map).map(
    ([title,skills])=>({title,skills})
  );

}


  /* ------------------------------------------------------------------------
     Helper Functions
  ------------------------------------------------------------------------ */

  function createTag(text){

    const tag = document.createElement("span");

    tag.textContent = text;

    return tag;

  }

  function clearElement(element){

    element.innerHTML = "";

  }

  function createWorkflowStep(text){

    const step = document.createElement("span");

    step.className = "skills__workflow-step";

    step.textContent = text;

    return step;

  }

  function createWorkflowArrow(){

    const arrow = document.createElement("span");

    arrow.className = "skills__workflow-arrow";

    arrow.innerHTML = "&rarr;";

    return arrow;

  }

  function getSkillsByCategory(category){

    return Object.entries(skillsData).filter(

      ([,skill]) => skill.category === category

    );

  }

    /* ------------------------------------------------------------------------
     Skills Database
  ------------------------------------------------------------------------ */

  const skillsData = {

    python:{

      title:"Python",

      icon:"python",

      category:"Programming",

      role:"Python is the primary automation language in modern DevOps. It is widely used for infrastructure automation, cloud scripting, API integrations, monitoring utilities and custom DevOps tools.",

      concepts:[
        "Variables",
        "Functions",
        "Modules",
        "Virtual Environment",
        "Object Oriented Programming",
        "Boto3"
      ],

      useCases:[
        "Infrastructure Automation",
        "AWS SDK",
        "Automation Scripts",
        "Custom CLI Tools"
      ],

      related:[
        "Linux",
        "Bash",
        "AWS",
        "Ansible"
      ],

      workflow:[
        "Developer",
        "Python Script",
        "Cloud Infrastructure"
      ]

    },

    git:{

      title:"Git",

      icon:"git",

      category:"Version Control",

      role:"Git tracks every source code change, making collaboration, branching, merging and version history management possible across software teams.",

      concepts:[
        "Repository",
        "Commit",
        "Branch",
        "Merge",
        "Rebase",
        "Clone"
      ],

      useCases:[
        "Version Control",
        "Source History",
        "Team Collaboration",
        "Rollback"
      ],

      related:[
        "GitHub",
        "GitLab",
        "Jenkins"
      ],

      workflow:[
        "Developer",
        "Git Commit",
        "GitHub"
      ]

    },

    github:{

      title:"GitHub",

      icon:"github",

      category:"Version Control",

      role:"GitHub hosts Git repositories and provides collaboration features along with automation through GitHub Actions.",

      concepts:[
        "Repository",
        "Fork",
        "Pull Request",
        "Actions",
        "Issues",
        "Releases"
      ],

      useCases:[
        "Remote Repository",
        "Code Review",
        "CI Trigger",
        "Open Source Collaboration"
      ],

      related:[
        "Git",
        "Jenkins",
        "Docker"
      ],

      workflow:[
        "Git",
        "GitHub",
        "CI Pipeline"
      ]

    },

    linux:{

      title:"Linux",

      icon:"linux",

      category:"Operating System",

      role:"Linux powers the majority of cloud servers, containers and enterprise infrastructure, making it the foundation of every DevOps environment.",

      concepts:[
        "Filesystem",
        "Permissions",
        "Processes",
        "Systemctl",
        "Networking",
        "SSH"
      ],

      useCases:[
        "Server Administration",
        "Cloud Servers",
        "Containers",
        "Automation"
      ],

      related:[
        "Bash",
        "Docker",
        "Kubernetes"
      ],

      workflow:[
        "Linux Server",
        "Docker",
        "Production"
      ]

    },

    bash:{

      title:"Bash",

      icon:"bash",

      category:"Operating System",

      role:"Bash enables automation of repetitive administrative tasks using shell scripting, making server management significantly more efficient.",

      concepts:[
        "Variables",
        "Conditions",
        "Loops",
        "Functions",
        "Arguments",
        "Cron"
      ],

      useCases:[
        "Server Automation",
        "Deployment Scripts",
        "Maintenance",
        "Monitoring"
      ],

      related:[
        "Linux",
        "Python",
        "Ansible"
      ],

      workflow:[
        "Linux",
        "Bash Script",
        "Automation"
      ]

    },

        docker:{

      title:"Docker",

      icon:"docker",

      category:"Containerization",

      role:"Docker packages applications together with their dependencies into lightweight containers, ensuring identical execution across development, testing and production environments.",

      concepts:[
        "Images",
        "Containers",
        "Dockerfile",
        "Volumes",
        "Networks",
        "Docker Compose"
      ],

      useCases:[
        "Microservices",
        "Application Packaging",
        "CI/CD Pipelines",
        "Development Environment"
      ],

      related:[
        "Linux",
        "Jenkins",
        "Kubernetes"
      ],

      workflow:[
        "Developer",
        "Git",
        "Docker",
        "Container Registry"
      ]

    },

    aws:{

      title:"Amazon Web Services",

      icon:"aws",

      category:"Cloud",

      role:"AWS provides scalable cloud infrastructure and managed services for deploying, hosting and operating modern applications worldwide.",

      concepts:[
        "EC2",
        "S3",
        "IAM",
        "VPC",
        "CloudWatch",
        "RDS"
      ],

      useCases:[
        "Cloud Hosting",
        "Virtual Servers",
        "Storage",
        "Monitoring"
      ],

      related:[
        "Terraform",
        "Docker",
        "Kubernetes"
      ],

      workflow:[
        "Infrastructure",
        "AWS",
        "Production"
      ]

    },

    terraform:{

      title:"Terraform",

      icon:"terraform",

      category:"Infrastructure as Code",

      role:"Terraform provisions and manages cloud infrastructure using declarative configuration files, making deployments repeatable and version controlled.",

      concepts:[
        "Providers",
        "Resources",
        "Modules",
        "State File",
        "Variables",
        "Outputs"
      ],

      useCases:[
        "Infrastructure Provisioning",
        "Cloud Automation",
        "Multi Cloud Deployment",
        "Reusable Infrastructure"
      ],

      related:[
        "AWS",
        "Git",
        "Ansible"
      ],

      workflow:[
        "Git",
        "Terraform",
        "AWS"
      ]

    },

    ansible:{

      title:"Ansible",

      icon:"ansible",

      category:"Infrastructure as Code",

      role:"Ansible automates server configuration, software installation and environment management using simple YAML playbooks.",

      concepts:[
        "Inventory",
        "Playbooks",
        "Roles",
        "Tasks",
        "Handlers",
        "Variables"
      ],

      useCases:[
        "Server Configuration",
        "Automation",
        "Software Deployment",
        "Infrastructure Management"
      ],

      related:[
        "Linux",
        "Terraform",
        "Docker"
      ],

      workflow:[
        "Infrastructure",
        "Ansible",
        "Configured Servers"
      ]

    },

    jenkins:{

      title:"Jenkins",

      icon:"jenkins",

      category:"CI/CD",

      role:"Jenkins automates building, testing and deploying applications, enabling Continuous Integration and Continuous Delivery workflows.",

      concepts:[
        "Pipeline",
        "Agent",
        "Stages",
        "Freestyle Job",
        "Webhooks",
        "Artifacts"
      ],

      useCases:[
        "Continuous Integration",
        "Continuous Delivery",
        "Automated Testing",
        "Deployment Pipeline"
      ],

      related:[
        "GitHub",
        "Docker",
        "Kubernetes"
      ],

      workflow:[
        "GitHub",
        "Jenkins",
        "Docker",
        "Deployment"
      ]

    },
        gitlab:{
      title:"GitLab",
      icon:"gitlab",
      category:"CI/CD",
      role:"GitLab is a complete DevOps platform that combines source code management with built-in CI/CD pipelines.",
      concepts:["Repository","Merge Request","Runner","Pipeline","Registry","CI/CD"],
      useCases:["Source Control","CI/CD","Container Registry","DevOps Platform"],
      related:["Git","Docker","Kubernetes"],
      workflow:["Developer","GitLab","Pipeline","Deployment"]
    },

    kubernetes:{
      title:"Kubernetes",
      icon:"kubernetes",
      category:"Container Orchestration",
      role:"Kubernetes automates deployment, scaling and management of containerized applications across clusters.",
      concepts:["Pod","Deployment","Service","Ingress","Namespace","ConfigMap"],
      useCases:["Container Orchestration","Auto Scaling","High Availability","Production Deployments"],
      related:["Docker","AWS","Argo CD"],
      workflow:["Docker","Kubernetes","Production"]
    },

    argocd:{
      title:"Argo CD",
      icon:"argocd",
      category:"GitOps",
      role:"Argo CD continuously synchronizes Kubernetes clusters with Git repositories, enabling GitOps-based deployments.",
      concepts:["Application","Sync","Repository","GitOps","Rollback","Health"],
      useCases:["Continuous Deployment","GitOps","Kubernetes Automation","Production Releases"],
      related:["GitHub","Kubernetes","Helm"],
      workflow:["GitHub","Argo CD","Kubernetes"]
    },

    prometheus:{
      title:"Prometheus",
      icon:"prometheus",
      category:"Monitoring",
      role:"Prometheus collects metrics from applications and infrastructure for monitoring, alerting and performance analysis.",
      concepts:["Metrics","Exporter","Targets","Alertmanager","Time Series","Scraping"],
      useCases:["Infrastructure Monitoring","Application Metrics","Alerting","Performance Analysis"],
      related:["Grafana","Kubernetes","Docker"],
      workflow:["Infrastructure","Prometheus","Metrics"]
    },

    grafana:{
      title:"Grafana",
      icon:"grafana",
      category:"Monitoring",
      role:"Grafana visualizes infrastructure and application metrics through interactive dashboards and alerts.",
      concepts:["Dashboard","Panels","Datasource","Alerts","Visualization","Variables"],
      useCases:["Monitoring Dashboards","Business Metrics","Infrastructure Health","Alert Visualization"],
      related:["Prometheus","Loki","Kubernetes"],
      workflow:["Prometheus","Grafana","Dashboard"]
    }

  };

  state.categories=getCategories();
    /* ------------------------------------------------------------------------
     Render Categories
  ------------------------------------------------------------------------ */

  function renderCategories(){

    clearElement(ui.categories);

    categories.forEach(category=>{

      const button=document.createElement("button");

      button.type="button";

      button.className="skills__category";

      button.dataset.category=category.title;

      button.innerHTML=`
        <span>${category.title}</span>
      `;

      if(category.title===state.activeCategory){

        button.classList.add("is-active");

      }

      ui.categories.appendChild(button);

    });

  }
  state.categories=getCategories();

  function renderCategories(){

  ui.categories.innerHTML="";

  state.categories.forEach((cat,index)=>{

    const item=document.createElement("button");

    item.type="button";
    item.className="skills__category";
    item.dataset.index=index;

    item.innerHTML=`<span>${cat.title}</span>`;

    if(index===state.currentCategory)
      item.classList.add("is-active");

    ui.categories.appendChild(item);

  });

}

function renderSkills(){

  ui.skills.innerHTML="";

  const category=state.categories[state.currentCategory];

  category.skills.forEach((key,index)=>{

    const skill=skillsData[key];

    const card=document.createElement("button");

    card.type="button";
    card.className="skills__skill";
    card.dataset.skill=key;
    card.dataset.index=index;

    card.innerHTML=`
      <div class="skills__skill-icon">
        ${renderIcon(skill.icon,42)}
      </div>
      <div class="skills__skill-name">
        ${skill.title}
      </div>
    `;

    if(index===state.currentSkill)
      card.classList.add("is-active");

    ui.skills.appendChild(card);

  });

}
function nextSkill(){

  if(state.paused||state.manual)return;

  const category=state.categories[state.currentCategory];

  state.currentSkill++;

  if(state.currentSkill>=category.skills.length){

    state.currentSkill=0;

    state.currentCategory++;

    if(state.currentCategory>=state.categories.length)
      state.currentCategory=0;

    renderCategories();
    renderSkills();

  }

  const skillKey=
    state.categories[state.currentCategory]
    .skills[state.currentSkill];

  ui.card.classList.add("is-updating");

setTimeout(()=>{

    updateSkillCard(skillKey);

    ui.card.classList.remove("is-updating");

},180);

}
function startLoop(){

    clearTimeout(state.timer);

    if(state.paused||state.manual)return;

    state.timer=setTimeout(()=>{

        nextSkill();

        startLoop();

    },state.delay);

}
function pauseLoop(){

    state.paused=true;

    clearTimeout(state.timer);

}

function resumeLoop(){

    if(state.manual)return;

    state.paused=false;

    startLoop();

}


  /* ------------------------------------------------------------------------
     Render Roadmap
  ------------------------------------------------------------------------ */

 
    /* ------------------------------------------------------------------------
     Render Tags
  ------------------------------------------------------------------------ */

  function renderTags(container,data){

    clearElement(container);

    data.forEach(item=>{

      container.appendChild(createTag(item));

    });

  }

  /* ------------------------------------------------------------------------
     Render Workflow
  ------------------------------------------------------------------------ */

  function renderWorkflow(flow){

    clearElement(ui.workflow);

    flow.forEach((step,index)=>{

      ui.workflow.appendChild(

        createWorkflowStep(step)

      );

      if(index<flow.length-1){

        ui.workflow.appendChild(

          createWorkflowArrow()

        );

      }

    });

  }

  /* ------------------------------------------------------------------------
     Update Skill Card
  ------------------------------------------------------------------------ */

  function updateSkillCard(key){

    const skill=skillsData[key];

    if(!skill) return;

    state.activeSkill=key;

    state.activeCategory=skill.category;

    ui.card.classList.remove("is-updating");

    void ui.card.offsetWidth;

    ui.card.classList.add("is-updating");

    ui.icon.innerHTML=

      renderIcon(skill.icon,48);

    ui.title.textContent=

      skill.title;

    ui.category.textContent=

      skill.category;

    ui.role.textContent=

      skill.role;

    renderTags(

      ui.concepts,

      skill.concepts

    );

    renderTags(

      ui.useCases,

      skill.useCases

    );

    renderTags(

      ui.related,

      skill.related

    );

    renderWorkflow(

      skill.workflow

    );

   $all(".skills__category").forEach((item,i)=>{
  item.classList.toggle(
    "is-active",
    i===state.currentCategory
  );
});

$all(".skills__skill").forEach((item,i)=>{
  item.classList.toggle(
    "is-active",
    i===state.currentSkill
  );
});

  }
    /* ------------------------------------------------------------------------
     Activate Skill
  ------------------------------------------------------------------------ */

  

  /* ------------------------------------------------------------------------
     Bind Events
  ------------------------------------------------------------------------ */
function bindEvents(){

  ui.section.addEventListener(
    "mouseenter",
    pauseLoop
  );

  ui.section.addEventListener(
    "mouseleave",
    resumeLoop
  );

  ui.skills.addEventListener("click",e=>{

    const card=e.target.closest(".skills__skill");

    if(!card)return;

    state.manual=true;

clearTimeout(state.timer);

state.timer=setTimeout(()=>{

    state.manual=false;

    startLoop();

},8000);

    pauseLoop();

    const category=
      state.categories[state.currentCategory];

    state.currentSkill=
      Number(card.dataset.index);

    ui.card.classList.add("is-updating");

setTimeout(()=>{

    updateSkillCard(
        category.skills[state.currentSkill]
    );

    ui.card.classList.remove("is-updating");

},180);

  });

}
 

  /* ------------------------------------------------------------------------
     Initialize
  ------------------------------------------------------------------------ */

  renderCategories();

renderSkills();

updateSkillCard(
  state.categories[0].skills[0]
);

bindEvents();

startLoop();
}











/* ==========================================================================
   8. PROJECTS — filterable grid with tilt on hover
   ========================================================================== */
function initProjects() {
  const grid = $('#projectsGrid');
  const filters = $all('.filter-btn');
  if (!grid || !filters.length) return;

  const cards = $all('.project-card', grid);

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const cats = (card.dataset.cat || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  if (isTouchDevice || prefersReducedMotion) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(900px) rotateX(${(-py * 3).toFixed(2)}deg) rotateY(${(px * 3).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ==========================================
   LinuxOps Premium Slideshow
========================================== */

const screenshots = [

    { name:"System Dashboard", file:"dashboard.png" },
    { name:"User Management", file:"users.png" },
    { name:"File Management", file:"files.png" },
    { name:"Backup Management", file:"backup.png" },
    { name:"Log Management", file:"logs.png" },
    { name:"Network Management", file:"network.png" },
    { name:"Package Management", file:"packages.png" },
    { name:"Service Management", file:"services.png" },
    { name:"Process Management", file:"process.png" },
    { name:"Disk Management", file:"disk.png" },
    { name:"Live Health Monitor", file:"health.png" }

];

let currentShot = 0;

const preview = document.getElementById("linuxops-preview");
const moduleName = document.getElementById("module-name");
const counter = document.getElementById("terminal-counter");
const dots = document.querySelectorAll(".slide-dot");
const terminal = document.querySelector(".terminal-window");

let slideInterval;

/* ---------- Preload Images ---------- */

screenshots.forEach(screen => {

    const img = new Image();

    img.src = `assets/projects/linuxops/${screen.file}`;

});

/* ---------- Update UI ---------- */

function updateSlide(){

    preview.style.opacity = 0;

    preview.style.transform = "scale(1)";

    setTimeout(()=>{

        preview.src = `assets/projects/linuxops/${screenshots[currentShot].file}`;

        moduleName.textContent = screenshots[currentShot].name;

        counter.textContent =
            `${currentShot+1} / ${screenshots.length}`;

        dots.forEach(dot=>dot.classList.remove("active"));

        dots[currentShot].classList.add("active");

        preview.style.opacity = 1;

        preview.style.transform = "scale(1.04)";

    },350);

}

/* ---------- Next ---------- */

function nextSlide(){

    currentShot++;

    if(currentShot>=screenshots.length){

        currentShot=0;

    }

    updateSlide();

}

/* ---------- Start ---------- */

function startSlideshow(){

    slideInterval = setInterval(nextSlide,3000);

}

/* ---------- Stop ---------- */

function stopSlideshow(){

    clearInterval(slideInterval);

}

/* ---------- Initialize ---------- */

if(preview){

    updateSlide();

    startSlideshow();

    terminal.addEventListener("mouseenter",stopSlideshow);

    terminal.addEventListener("mouseleave",startSlideshow);

}


/* ==========================================================================
   9. CERTIFICATIONS — cursor-tracked spotlight
   ========================================================================== */
function initCertificates() {
  const grid = $('#certsGrid');
  if (!grid) return;

  $all('.cert-card', grid).forEach((card) => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
  });

  if (isTouchDevice || prefersReducedMotion) return;

  grid.addEventListener('mousemove', (e) => {
    const rect = grid.getBoundingClientRect();
    grid.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    grid.style.setProperty('--spot-y2', `${e.clientY - rect.top}px`);
  });
}

/* ==========================================================================
   10. RESUME MODAL
   ========================================================================== */
function initResume() {
  const modal = $('#resumeModal');
  const openers = $all('.js-open-resume');
  if (!modal || !openers.length) return;

  const closers = $all('[data-close-resume]', modal);
  const iframe = $('#resumeFrame', modal) || $('iframe', modal);
  const printBtn = $('#printResumeBtn', modal);
  const resumePath = (iframe && iframe.getAttribute('src')) || 'assets/resume/Ujjwal_Agarwal_Resume.pdf';

  let lastFocused = null;
  let checked = false;

  const checkResumeExists = async () => {
    if (checked) return;
    checked = true;
    try {
      const res = await fetch(resumePath, { method: 'HEAD' });
      if (!res.ok) modal.classList.add('resume-missing');
    } catch {
      modal.classList.add('resume-missing');
    }
  };

  const open = () => {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    checkResumeExists();
    const closeBtn = $('.resume-modal__close', modal);
    if (closeBtn) closeBtn.focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  openers.forEach((btn) => btn.addEventListener('click', (e) => {
    e.preventDefault();
    open();
  }));
  closers.forEach((el) => el.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('is-open')) return;
    const focusables = $all('a[href], button:not([disabled]), iframe', modal);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  if (printBtn && iframe) {
    printBtn.addEventListener('click', () => {
      try {
        iframe.contentWindow.print();
      } catch {
        window.open(resumePath, '_blank', 'noopener');
      }
    });
  }
}

/* ==========================================================================
   11. CONTACT FORM
   ========================================================================== */
function initContact() {
  const form = $('#contactForm');
  const status = $('#formStatus');
  if (!form) return;

  const setStatus = (msg, isError = false) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? 'var(--orange)' : 'var(--emerald)';
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#cf-name', form);
    const email = $('#cf-email', form);
    const message = $('#cf-message', form);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name?.value.trim()) {
      setStatus('Please enter your name.', true);
      name?.focus();
      return;
    }
    if (!email?.value.trim() || !emailPattern.test(email.value.trim())) {
      setStatus('Please enter a valid email address.', true);
      email?.focus();
      return;
    }
    if (!message?.value.trim()) {
      setStatus('Please enter a message.', true);
      message?.focus();
      return;
    }

    const submitBtn = $('.form-submit', form);
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    const subject = encodeURIComponent(`Portfolio contact from ${name.value.trim()}`);
    const body = encodeURIComponent(`${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`);
    const mailtoHref = form.dataset.mailto || 'mailto:contact@example.com';
    window.location.href = `${mailtoHref}?subject=${subject}&body=${body}`;

    setStatus('Opening your email client…');
    window.setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
      form.reset();
    }, 1200);
  });
}

/* ==========================================================================
   12. RIPPLE + MAGNETIC MICRO-INTERACTIONS
   ========================================================================== */
function initRipple() {
  if (prefersReducedMotion) return;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.ripple');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple-el';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
  });
}

function initMagnetic() {
  if (isTouchDevice || prefersReducedMotion) return;
  $all('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ==========================================================================
   13. FOOTER
   ========================================================================== */
function initFooter() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

/* ==========================================================================
   BOOT — every module runs independently
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  safeInit('loader', initLoader);
  safeInit('placeholderLinkGuard', initPlaceholderLinkGuard);
  safeInit('nav', initNav);
  safeInit('scrollProgress', initScrollProgress);
  safeInit('cursorGlow', initCursorGlow);
  safeInit('backToTop', initBackToTop);
  safeInit('hero', initHero);
  safeInit('journey', initJourney);
  safeInit('skills', initSkills);
  safeInit('projects', initProjects);
  safeInit('certificates', initCertificates);
  safeInit('resume', initResume);
  safeInit('contact', initContact);
  safeInit('ripple', initRipple);
  safeInit('magnetic', initMagnetic);
  safeInit('footer', initFooter);
  // Must run after skills/projects/certs have injected their .reveal elements
  safeInit('revealObserver', initRevealObserver);
});
