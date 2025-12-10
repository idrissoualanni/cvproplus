document.addEventListener('DOMContentLoaded', function() {

    // --- Logique pour le carrousel ---
    const slides = document.querySelectorAll('.carousel-slide');
    const navContainer = document.querySelector('.carousel-nav');
    const heroSection = document.querySelector('.hero-carousel-section');
    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0 && navContainer) {
        // Créer les points de navigation
        slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                goToSlide(index);
                resetInterval();
            });
            navContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.carousel-dot');

        function goToSlide(slideIndex) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = slideIndex;

            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            // Mettre à jour la couleur d'accentuation
            const activeColor = slides[currentSlide].dataset.color || '#4A90E2';
            if (heroSection) heroSection.style.setProperty('--active-color', activeColor);
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            goToSlide(nextIndex);
        }

        function startInterval() {
            slideInterval = setInterval(nextSlide, 5000); // Change de slide toutes les 5 secondes
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startInterval();
        }

        goToSlide(0); // Initialise la première slide
        startInterval();
    }

    // --- Logique pour l'animation au défilement des cartes de service ---
    const cards = document.querySelectorAll('.service-card');

    if (cards.length > 0) {
        const observerOptions = {
            root: null, // par rapport au viewport
            rootMargin: '0px',
            threshold: 0.1 // se déclenche quand 10% de l'élément est visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        cards.forEach(card => {
            observer.observe(card);
        });
    }

    // --- Logique pour le formulaire d'optimisation ---
    const cvForm = document.getElementById('cv-form');

    if (cvForm) {
        const statusDiv = document.getElementById('form-status');
        const submitBtn = document.getElementById('submit-btn');

        // IMPORTANT : Remplacez cette URL par l'URL de votre propre Web App Google Apps Script
        const GOOGLE_SCRIPT_URL = 'VOTRE_URL_DE_SCRIPT_GOOGLE_APPS_ICI';

        cvForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const selectedOptions = document.querySelectorAll('input[name="options"]:checked');

            // Validation : vérifier si au moins une option est cochée
            if (selectedOptions.length === 0) {
                statusDiv.style.display = 'block';
                statusDiv.style.backgroundColor = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.textContent = 'Veuillez sélectionner au moins une option d\'optimisation.';
                return; // Arrête l'envoi du formulaire
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';
            statusDiv.style.display = 'none';

            const cvFile = document.getElementById('cv-file').files[0];
            const reader = new FileReader();

            reader.onload = function (event) {
                const fileData = {
                    base64: event.target.result.split(',')[1], // Extrait les données base64
                    type: cvFile.type,
                    name: cvFile.name
                };

                const optionsValues = Array.from(selectedOptions)
                                             .map(cb => cb.value);

                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    options: optionsValues.join(', '),
                    cvFile: fileData
                };

                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(formData),
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8', // Requis par Google Apps Script pour les POST
                    },
                })
                .then(response => response.json())
                .then(data => {
                    statusDiv.style.display = 'block';
                    statusDiv.style.backgroundColor = '#d4edda';
                    statusDiv.style.color = '#155724';
                    statusDiv.textContent = 'Merci ! Votre CV a bien été envoyé. Nous vous recontacterons bientôt.';
                    cvForm.reset();
                })
                .catch(error => {
                    statusDiv.style.display = 'block';
                    statusDiv.style.backgroundColor = '#f8d7da';
                    statusDiv.style.color = '#721c24';
                    statusDiv.textContent = 'Une erreur est survenue. Veuillez réessayer plus tard.';
                    console.error('Error:', error);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Envoyer pour optimisation';
                });
            };

            if (cvFile) {
                reader.readAsDataURL(cvFile); // Déclenche la lecture du fichier
            }
        });
    }
});
