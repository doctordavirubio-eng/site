document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. CABEÇALHO FIXO E SCROLL ATIVO
       ========================================================================== */
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Adiciona sombra e encolhe o header ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        highlightActiveSection();
    });

    // Destaca o link ativo no menu conforme o usuário rola a página
    function highlightActiveSection() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120; // Compensação da altura do header
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    /* ==========================================================================
       2. MENU MOBILE RESPONSIVO
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle-btn');
    const primaryNav = document.getElementById('primary-navigation');

    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isVisible = primaryNav.getAttribute('data-visible') === 'true';
            
            if (!isVisible) {
                primaryNav.setAttribute('data-visible', 'true');
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                primaryNav.setAttribute('data-visible', 'false');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fecha o menu ao clicar em qualquer link (útil para navegação Single Page)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                primaryNav.setAttribute('data-visible', 'false');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ==========================================================================
       3. CARROSSEL DE PROFILAXIA AUTOPLAY (ANTES E DEPOIS)
       ========================================================================== */
    const prophCarousel = document.getElementById('prophylaxis-carousel');
    const prophSlides = document.querySelectorAll('.prophylaxis-slide');
    const prophDots = document.querySelectorAll('.prophylaxis-dot');
    
    if (prophCarousel && prophSlides.length > 0) {
        let prophIndex = 0;
        let prophTimer;
        
        function showProphSlide(index) {
            prophSlides.forEach(slide => slide.classList.remove('active'));
            prophDots.forEach(dot => dot.classList.remove('active'));
            
            prophSlides[index].classList.add('active');
            if (prophDots[index]) {
                prophDots[index].classList.add('active');
            }
        }
        
        function nextProphSlide() {
            prophIndex = (prophIndex + 1) % prophSlides.length;
            showProphSlide(prophIndex);
        }
        
        function startProphTimer() {
            clearInterval(prophTimer);
            prophTimer = setInterval(nextProphSlide, 4000); // Transição a cada 4 segundos
        }
        
        // Adiciona evento de clique aos dots
        prophDots.forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                prophIndex = idx;
                showProphSlide(prophIndex);
                startProphTimer();
            });
        });
        
        // Inicializa o autoplay
        startProphTimer();
    }

    /* ==========================================================================
       4. CARROSSEL DE DEPOIMENTOS (TESTIMONIALS - MULTI-ITENS SLIDER)
       ========================================================================== */
    const track = document.getElementById('testimonials-track');
    const cards = document.querySelectorAll('.testimonial-img-card');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentIndex = 0;
    let autoSlideTimer;

    // Retorna a quantidade de depoimentos visíveis baseada na largura da tela
    function getVisibleCount() {
        const width = window.innerWidth;
        if (width > 1024) return 4;
        if (width > 768) return 3;
        if (width > 480) return 2;
        return 1;
    }

    // Calcula o deslocamento e atualiza a posição do slide
    function updateSlider() {
        const visibleCount = getVisibleCount();
        if (cards.length === 0) return;
        
        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = 20; // Combinar com o gap de 20px no CSS
        
        const shift = (cardWidth + gap) * currentIndex;
        track.style.transform = `translateX(-${shift}px)`;
        
        updateActiveIndicator();
    }

    // Cria os indicadores (dots) dinamicamente com base nas colunas visíveis
    function createIndicators() {
        if (!indicatorsContainer || cards.length === 0) return;
        const visibleCount = getVisibleCount();
        const numDots = Math.ceil(cards.length / visibleCount);
        
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('span');
            dot.classList.add('indicator');
            if (i === 0) dot.classList.add('active');
            
            // Determina qual índice inicial esse dot representa
            let targetIndex = i * visibleCount;
            const maxIndex = cards.length - visibleCount;
            if (targetIndex > maxIndex) {
                targetIndex = maxIndex;
            }
            
            dot.setAttribute('data-target-index', targetIndex);
            
            dot.addEventListener('click', (e) => {
                currentIndex = parseInt(e.target.getAttribute('data-target-index'));
                updateSlider();
                startAutoSlide();
            });
            
            indicatorsContainer.appendChild(dot);
        }
    }

    // Atualiza a classe ativa do indicador correspondente ao slide visível
    function updateActiveIndicator() {
        const dots = indicatorsContainer.querySelectorAll('.indicator');
        if (dots.length === 0) return;
        
        const visibleCount = getVisibleCount();
        
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            const target = parseInt(dot.getAttribute('data-target-index'));
            
            // Se o índice atual estiver no intervalo representado por este ponto, ativa-o
            const nextDot = dots[i + 1];
            const nextTarget = nextDot ? parseInt(nextDot.getAttribute('data-target-index')) : Infinity;
            
            if (currentIndex >= target && currentIndex < nextTarget) {
                dot.classList.add('active');
            }
        });
    }

    function nextSlide() {
        const visibleCount = getVisibleCount();
        const maxIndex = cards.length - visibleCount;
        
        if (currentIndex >= maxIndex) {
            currentIndex = 0; // Volta ao início
        } else {
            currentIndex++;
        }
        updateSlider();
    }

    function prevSlide() {
        const visibleCount = getVisibleCount();
        const maxIndex = cards.length - visibleCount;
        
        if (currentIndex <= 0) {
            currentIndex = maxIndex; // Vai ao final
        } else {
            currentIndex--;
        }
        updateSlider();
    }

    // Inicia o auto-slide a cada 6 segundos
    function startAutoSlide() {
        clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(nextSlide, 6000);
    }

    if (prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    // Inicialização do Slider
    if (cards.length > 0) {
        createIndicators();
        updateSlider();
        startAutoSlide();
        
        // Garante redimensionamento responsivo perfeito recalculando posições
        window.addEventListener('resize', () => {
            createIndicators();
            const visibleCount = getVisibleCount();
            const maxIndex = cards.length - visibleCount;
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            updateSlider();
        });
        
        // Recalcula logo após carregar tudo para acertar o tamanho das imagens recém-carregadas
        window.addEventListener('load', () => {
            updateSlider();
        });
    }

    /* ==========================================================================
       5. ACORDEÃO DE PERGUNTAS FREQUENTES (FAQ)
       ========================================================================== */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            const isItemActive = accordionItem.classList.contains('active');
            const collapseContainer = accordionItem.querySelector('.accordion-collapse');
            
            // Fecha outros itens antes de abrir o atual (efeito acordeão real)
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    item.querySelector('.accordion-collapse').style.maxHeight = '0';
                }
            });

            // Alterna o estado do item atual
            if (!isItemActive) {
                accordionItem.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                // Define a altura dinâmica baseada no tamanho do conteúdo
                collapseContainer.style.maxHeight = collapseContainer.scrollHeight + 'px';
            } else {
                accordionItem.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                collapseContainer.style.maxHeight = '0';
            }
        });
    });

});
