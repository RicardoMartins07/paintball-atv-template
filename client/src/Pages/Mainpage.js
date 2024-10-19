import Navbar from '../Components/Navbar/Navbar';
import paintball from '../Assets/paintball.jpg';
import paintball2 from '../Assets/paintball2.jpg';
import atv from '../Assets/atv.jpg';
import FAQ from '../Components/FAQ/FAQ';
import phone from '../Assets/telefonema.png';
import morada from '../Assets/navegacao-gps.png';
import relogio from '../Assets/relogio.png';
import instagram from '../Assets/instagram.png';
import facebook from '../Assets/facebook.png';
import { Link } from 'react-router-dom';

function Mainpage() {
    return (
        <>
        <section className='hero-section-introduction'>
        <Navbar />
      
      <div className='hero'>
        <div className='hero-introduction'> 
          <h1>Liberte o seu aventureiro interior connosco</h1>
          <p>Mergulhe em experiências emocionantes com nossas derradeiras aventuras de paintball e quadriciclo, onde a emoção encontra terrenos de tirar o fôlego e uma ação incomparável aguarda. </p>
          <Link to="/reservas"><button className='btn-reserva'>Reserve agora</button></Link>
        </div>

        
          <img src={paintball} alt='Paintball game' />
        
      </div>
        
        
      </section>

      <section className='a-area'>
        <div className='a-margens'>
        <div className='feature'>
          <h2>Emo&ccedil;&otilde;es de Paintball</h2>
          <p>Experimente a ação de paintball de bater o coração, perfeito para iniciantes e jogadores experientes que procuram emoção. </p>
        </div>
        <div className='separator' />
        <div className='feature'>
          <h2>Expedi&ccedil;&otilde;es ATV</h2>
          <p>Embarque em trilhas de quadriciclo de tirar o fôlego para aventuras off-road inesquecíveis cheias de emoção e exploração. </p>
        </div>
        <div className='separator' />
        <div className='feature'>
          <h2>Seguran&ccedil;a em primeiro lugar</h2>
          <p>Garantindo a máxima seguran&ccedil;a com briefings abrangentes e equipamentos de alto nível para todos. </p>
        </div>
        <div className='separator' />
        <div className='feature'>
          <h2>Eventos em Grupo</h2>
          <p>Organize eventos de grupo repletos de a&ccedil;&atilde;o, perfeitos para team-building e celebra&ccedil;&otilde;es. </p>
        </div>
        </div>
      </section>

      <section className='info-services'>

        <div className='paintball'>
          <img src={paintball2} alt='Paintball game'/>
          <div className='info'>
            <h3>Experiência Ultimate Paintball espera por você aqui</h3>
            <p>Junte-se a nós para uma emocionante aventura de paintball. Mergulhe em uma ação emocionante e crie memórias inesquecíveis no campo de batalha. </p>
            <button className='btn-reserva'>Saiba mais</button>
          </div>
        </div>
        
        <div className='atv'>
          <div className='info'>
            <h3>Aventuras de ATV aguardam sua chegada hoje </h3>
            <p>Experimente a emoção de andar de quadriciclo por terrenos de tirar o fôlego. Liberte o seu espírito aventureiro e conquiste os trilhos connosco. </p>
            <p className='services'>Equipamentos de Segurança Incluído</p>
            <p className='services'>Pacotes de aventura personalizáveis disponíveis </p>
            <p className='services'>Visitas guiadas por trilhas oferecidas </p>
          </div>
          <img src={atv} alt='Atv'/>
          
        </div>
      </section>

      <div className='ad-area2'>
        <div className='ad-aventura'>
          <p>A Aventura Está Chamando</p>
        </div>
      </div>

      <section className='questions'>
          <div className='frequent-questions'>
            <h3>Perguntas Frequentes e Respostas Detalhadas </h3>
            <FAQ />
          </div>
          
      </section>

      <section className='contact'>
        <div className='contacts'>
          <div className='contacts-form'>
            <div className='contact-info morada'> <img src={morada} alt='Morada'/> <p>Morada</p></div>
            <div className='contact-info phone'><img src={phone} alt='Contacto'/> <p>Telemovel</p></div>
            <div className=' contact-info horario'><img src={relogio} alt='Horario Funcionamento'/> <p>Horario</p></div>
          </div>
          <img src={paintball} className='contact-img' alt='contactos'/>
        </div>
      </section>

      
      <footer className='footer'>
          <div className='footer-bottom'>
            <p className='copyright'>Copyright © 2024 All Rights Reserved by ...</p>
            <div className='social-footer'>
              <a href='#' target='blank'><img className='icon-social-footer' src={instagram} alt='instagram'></img></a>
              <a href='#' target='blank'><img className='icon-social-footer' src={facebook} alt='facebook'></img></a>
            </div>
          </div>
      </footer>
      </>
    );
  }
  
  export default Mainpage;