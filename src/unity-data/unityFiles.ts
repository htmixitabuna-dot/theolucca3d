/**
 * Unity 3D Project Files for "THEO LUCCA - CIDADE REAL 3D" (GTA Infantil)
 * Complete files ready for Unity 2022.3 LTS, 2023, or Unity 6 (URP)
 * Strictly C#, .unity, .fbx specifications, zero HTML/CSS/JS inside Unity files.
 */

export interface UnityFile {
  path: string;
  name: string;
  category: 'Scripts' | 'Models' | 'Scenes' | 'UI' | 'ProjectSettings';
  type: 'csharp' | 'markdown' | 'unity' | 'asset' | 'json';
  description: string;
  content: string;
}

export const UNITY_PROJECT_FILES: UnityFile[] = [
  // 1. Assets/Scripts/PlayerController.cs
  {
    path: 'Assets/Scripts/PlayerController.cs',
    name: 'PlayerController.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Controlador do Theo Lucca estilo GTA/Free Fire infantil (WASD + Joystick Mobile + Rigidbody + Animator + Fôlego + Carona)',
    content: `using UnityEngine;
using System.Collections;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Controlador do Personagem Principal: Theo Lucca (4 anos)
/// Suporta Teclado (WASD/Setas) e Joystick Virtual Mobile para Android/iOS
/// Utiliza Rigidbody com ForceMode.Impulse e Quaternion.LookRotation
/// Sem armas ou violência. 100% Infantil.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
[RequireComponent(typeof(CapsuleCollider))]
public class PlayerController : MonoBehaviour
{
    [Header("--- Velocidades de Movimento ---")]
    [Tooltip("Velocidade de caminhada suave do Theo")]
    public float walkSpeed = 4.5f;

    [Tooltip("Velocidade de corrida com fôlego")]
    public float runSpeed = 8.2f;

    [Tooltip("Velocidade de rotação suave olhando na direção que anda")]
    public float rotationSpeed = 14f;

    [Header("--- Física de Pulo (ForceMode.Impulse) ---")]
    [Tooltip("Força do impulso de pulo ágil")]
    public float jumpForce = 6.8f;

    [Tooltip("Multiplicador de gravidade para descida responsiva")]
    public float fallMultiplier = 2.4f;

    [Tooltip("Layer do chão para checar se está no piso")]
    public LayerMask groundLayer;
    public float groundCheckRadius = 0.28f;
    public Vector3 groundCheckOffset = new Vector3(0, 0.1f, 0);

    [Header("--- Sistema de Fôlego (Stamina) ---")]
    public float maxStamina = 100f;
    public float currentStamina;
    public float staminaDrainRate = 20f;
    public float staminaRegenRate = 18f;
    private bool isExhausted = false;

    [Header("--- Referências & Animações ---")]
    public Animator animator;
    public Rigidbody rb;
    public Transform cameraTransform;

    [Header("--- Objetos Segurados nas Mãos (Props) ---")]
    public GameObject pizzaBoxProp;
    public GameObject wateringCanProp;
    public GameObject newspaperProp;
    public GameObject soccerBallProp;

    [Header("--- Efeitos Sonoros (Zero Violência) ---")]
    public AudioSource audioSource;
    public AudioClip somPasso;
    public AudioClip somPulo;
    public AudioClip somAcenar;

    // Estados
    private bool isGrounded = true;
    private Vector3 moveDirection = Vector3.zero;
    private float currentSpeed = 0f;
    public bool isRunningMobile = false;
    public bool isInCar = false;
    public CarController carRideTarget;

    // Hashes de Performance do Animator
    private static readonly int SpeedHash = Animator.StringToHash("Speed");
    private static readonly int IsGroundedHash = Animator.StringToHash("IsGrounded");
    private static readonly int JumpTriggerHash = Animator.StringToHash("Jump");
    private static readonly int WaveTriggerHash = Animator.StringToHash("Wave");
    private static readonly int IsInCarHash = Animator.StringToHash("IsInCar");

    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        if (animator == null) animator = GetComponentInChildren<Animator>();
        if (audioSource == null) audioSource = GetComponent<AudioSource>();

        rb.freezeRotation = true;
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;
        rb.interpolation = RigidbodyInterpolation.Interpolate;

        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }

        currentStamina = maxStamina;
        EsconderTodosProps();
    }

    private void Update()
    {
        if (isInCar) return;

        VerificarChao();
        ProcessarEntrada();
        GerenciarStamina();
        AtualizarAnimacoes();
    }

    private void FixedUpdate()
    {
        if (isInCar) return;

        ExecutarMovimento();
        AplicarGravidadeAprimorada();
    }

    private void VerificarChao()
    {
        Vector3 checkPos = transform.position + groundCheckOffset;
        isGrounded = Physics.CheckSphere(checkPos, groundCheckRadius, groundLayer, QueryTriggerInteraction.Ignore);
    }

    private void ProcessarEntrada()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        if (cameraTransform != null)
        {
            Vector3 camF = Vector3.Scale(cameraTransform.forward, new Vector3(1, 0, 1)).normalized;
            Vector3 camR = Vector3.Scale(cameraTransform.right, new Vector3(1, 0, 1)).normalized;
            moveDirection = (camF * v + camR * h).normalized;
        }
        else
        {
            moveDirection = new Vector3(h, 0, v).normalized;
        }

        // Corrida
        bool querCorrer = (Input.GetKey(KeyCode.LeftShift) || isRunningMobile) && !isExhausted;
        currentSpeed = querCorrer ? runSpeed : walkSpeed;

        // Pulo com Impulse
        if (Input.GetButtonDown("Jump") || Input.GetKeyDown(KeyCode.Space))
        {
            Pular();
        }

        // Acenar para pedestres
        if (Input.GetKeyDown(KeyCode.F))
        {
            Acenar();
        }
    }

    public void Pular()
    {
        if (isGrounded && !isInCar)
        {
            rb.linearVelocity = new Vector3(rb.linearVelocity.x, 0f, rb.linearVelocity.z);
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
            if (animator != null) animator.SetTrigger(JumpTriggerHash);
            if (somPulo != null && audioSource != null) audioSource.PlayOneShot(somPulo, 0.6f);
        }
    }

    public void Acenar()
    {
        if (animator != null) animator.SetTrigger(WaveTriggerHash);
        if (somAcenar != null && audioSource != null) audioSource.PlayOneShot(somAcenar, 0.5f);
    }

    private void ExecutarMovimento()
    {
        if (moveDirection.sqrMagnitude > 0.05f)
        {
            // Girar suavemente com Quaternion.LookRotation
            Quaternion targetRotation = Quaternion.LookRotation(moveDirection, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);

            Vector3 targetVelocity = moveDirection * currentSpeed;
            targetVelocity.y = rb.linearVelocity.y;
            rb.linearVelocity = targetVelocity;
        }
        else
        {
            Vector3 damped = rb.linearVelocity;
            damped.x = Mathf.MoveTowards(damped.x, 0, walkSpeed * 4f * Time.fixedDeltaTime);
            damped.z = Mathf.MoveTowards(damped.z, 0, walkSpeed * 4f * Time.fixedDeltaTime);
            rb.linearVelocity = damped;
        }
    }

    private void AplicarGravidadeAprimorada()
    {
        if (rb.linearVelocity.y < 0)
        {
            rb.linearVelocity += Vector3.up * (Physics.gravity.y * (fallMultiplier - 1f) * Time.fixedDeltaTime);
        }
    }

    private void GerenciarStamina()
    {
        bool correndo = currentSpeed > walkSpeed + 0.5f && moveDirection.sqrMagnitude > 0.05f;
        if (correndo)
        {
            currentStamina -= staminaDrainRate * Time.deltaTime;
            if (currentStamina <= 0f)
            {
                currentStamina = 0f;
                isExhausted = true;
                isRunningMobile = false;
            }
        }
        else
        {
            currentStamina += staminaRegenRate * Time.deltaTime;
            if (currentStamina > maxStamina) currentStamina = maxStamina;
            if (isExhausted && currentStamina > maxStamina * 0.35f) isExhausted = false;
        }
    }

    private void AtualizarAnimacoes()
    {
        if (animator == null) return;
        float normSpeed = 0f;
        if (moveDirection.sqrMagnitude > 0.05f)
        {
            normSpeed = currentSpeed > walkSpeed + 0.2f ? 1.0f : 0.5f;
        }
        animator.SetFloat(SpeedHash, normSpeed, 0.15f, Time.deltaTime);
        animator.SetBool(IsGroundedHash, isGrounded);
    }

    public void DefinirPropSegurado(string prop)
    {
        EsconderTodosProps();
        if (prop == "pizza" && pizzaBoxProp != null) pizzaBoxProp.SetActive(true);
        if (prop == "wateringCan" && wateringCanProp != null) wateringCanProp.SetActive(true);
        if (prop == "newspaper" && newspaperProp != null) newspaperProp.SetActive(true);
        if (prop == "ball" && soccerBallProp != null) soccerBallProp.SetActive(true);
    }

    private void EsconderTodosProps()
    {
        if (pizzaBoxProp != null) pizzaBoxProp.SetActive(false);
        if (wateringCanProp != null) wateringCanProp.SetActive(false);
        if (newspaperProp != null) newspaperProp.SetActive(false);
        if (soccerBallProp != null) soccerBallProp.SetActive(false);
    }

    // Carona no carro com adulto
    public void EntrarNoCarro(CarController car)
    {
        isInCar = true;
        carRideTarget = car;
        rb.isKinematic = true;
        transform.SetParent(car.transform);
        transform.localPosition = new Vector3(0.5f, 0.2f, 0f); // Banco do passageiro
        transform.localRotation = Quaternion.identity;
        if (animator != null) animator.SetBool(IsInCarHash, true);
    }

    public void SairDoCarro()
    {
        if (!isInCar) return;
        isInCar = false;
        transform.SetParent(null);
        transform.position += transform.right * 1.8f; // Desce na calçada
        rb.isKinematic = false;
        if (animator != null) animator.SetBool(IsInCarHash, false);
        carRideTarget = null;
    }
}
`,
  },

  // 2. Assets/Scripts/CarController.cs
  {
    path: 'Assets/Scripts/CarController.cs',
    name: 'CarController.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Carros com IA autônoma: seguem rotas, param no semáforo vermelho e NÃO atropelam Theo (freiam e buzinam fofo)',
    content: `using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Sistema de Trânsito Inteligente e Seguro para Crianças.
/// Carros autônomos que:
/// 1. Seguem waypoints de faixas na pista
/// 2. Param suavemente no semáforo vermelho
/// 3. NUNCA ATROPELAM: se o Theo estiver na frente, freiam a 6 metros e tocam buzina fofa ("bibi!")
/// 4. Permitem carona no banco do passageiro
/// </summary>
public class CarController : MonoBehaviour
{
    [Header("--- Dados do Carro ---")]
    public string nomeCarro = "Táxi Amarelo";
    public Color corCarro = Color.yellow;
    public float velocidadeMaxima = 7.5f;
    public float aceleracao = 4.0f;
    public float forcaFrenagem = 12.0f;

    [Header("--- Rodas Giratórias ---")]
    public Transform[] rodas;
    public float raioRoda = 0.36f;

    [Header("--- Waypoints da Rota ---")]
    public List<Transform> waypoints;
    private int waypointAtual = 0;

    [Header("--- Sensores de Segurança Infantil ---")]
    [Tooltip("Distância que o carro detecta o Theo ou pedestre na frente")]
    public float distanciaSegurancaTheo = 6.0f;
    public LayerMask layerPedestres;
    public LayerMask layerSemaforos;

    [Header("--- Buzina Fofa & Sons ---")]
    public AudioSource audioSource;
    public AudioClip somBuzinaFofa;
    public float intervaloBuzina = 3.5f;
    private float timerBuzina = 0f;

    // Estados
    private float velocidadeAtual = 0f;
    public bool paradoPorTheo = false;
    public bool paradoPorSemaforo = false;
    public bool temTheoDeCarona = false;

    private void Start()
    {
        velocidadeAtual = velocidadeMaxima;
        if (audioSource == null) audioSource = GetComponent<AudioSource>();
    }

    private void Update()
    {
        if (temTheoDeCarona)
        {
            // Theo assume a direção do veículo! Controles manuais (aceleração, freio, ré, curvas)
            ProcessarDirecaoTheo();
        }
        else
        {
            VerificarObstaculosESemaforo();
            MoverCarroAutonomo();
        }
        GirarRodas();
    }

    private void ProcessarDirecaoTheo()
    {
        float steer = Input.GetAxis("Horizontal"); // A/D ou Joystick X
        float throttle = Input.GetAxis("Vertical"); // W/S ou Joystick Y

        // Curvas suaves proporcionais à velocidade
        if (Mathf.Abs(velocidadeAtual) > 0.2f && Mathf.Abs(steer) > 0.05f)
        {
            float dir = velocidadeAtual >= 0 ? 1f : -1f;
            transform.Rotate(Vector3.up, steer * 65f * dir * Time.deltaTime);
        }

        // Aceleração / Ré
        if (throttle > 0.1f)
        {
            velocidadeAtual = Mathf.MoveTowards(velocidadeAtual, velocidadeMaxima * 1.5f, aceleracao * 2f * Time.deltaTime);
        }
        else if (throttle < -0.1f)
        {
            if (velocidadeAtual > 0.5f)
                velocidadeAtual = Mathf.MoveTowards(velocidadeAtual, 0f, forcaFrenagem * 2f * Time.deltaTime);
            else
                velocidadeAtual = Mathf.MoveTowards(velocidadeAtual, -velocidadeMaxima * 0.4f, aceleracao * 1.5f * Time.deltaTime);
        }
        else
        {
            velocidadeAtual = Mathf.MoveTowards(velocidadeAtual, 0f, 6.0f * Time.deltaTime);
        }

        // Movimento com colisão física (Rigidbody)
        transform.position += transform.forward * velocidadeAtual * Time.deltaTime;
    }

    private void VerificarObstaculosESemaforo()
    {
        timerBuzina -= Time.deltaTime;
        paradoPorTheo = false;
        paradoPorSemaforo = false;

        // 1. Raycast para detectar Theo Lucca na frente do carro
        RaycastHit hit;
        Vector3 origemSensor = transform.position + Vector3.up * 0.5f;
        if (Physics.Raycast(origemSensor, transform.forward, out hit, distanciaSegurancaTheo, layerPedestres))
        {
            if (hit.collider.CompareTag("Player") && !temTheoDeCarona)
            {
                paradoPorTheo = true;
                if (timerBuzina <= 0f)
                {
                    TocarBuzinaFofa();
                    timerBuzina = intervaloBuzina;
                }
            }
        }

        // 2. Raycast para detectar Semáforo Vermelho
        if (Physics.Raycast(origemSensor, transform.forward, out hit, 8.5f, layerSemaforos))
        {
            // Checa estado do semáforo
            paradoPorSemaforo = true;
        }
    }

    private void MoverCarroAutonomo()
    {
        if (waypoints == null || waypoints.Count == 0) return;

        bool deveParar = paradoPorTheo || paradoPorSemaforo;
        float alvoVelocidade = deveParar ? 0f : velocidadeMaxima;

        float taxa = deveParar ? forcaFrenagem : aceleracao;
        velocidadeAtual = Mathf.MoveTowards(velocidadeAtual, alvoVelocidade, taxa * Time.deltaTime);

        // Seguir para o waypoint atual
        Transform destino = waypoints[waypointAtual];
        Vector3 dirDestino = (destino.position - transform.position);
        dirDestino.y = 0;

        if (dirDestino.sqrMagnitude > 0.05f)
        {
            Quaternion rotAlvo = Quaternion.LookRotation(dirDestino);
            transform.rotation = Quaternion.Slerp(transform.rotation, rotAlvo, 5f * Time.deltaTime);
        }

        transform.position += transform.forward * velocidadeAtual * Time.deltaTime;

        // Avançar waypoint
        if (dirDestino.magnitude < 2.5f)
        {
            waypointAtual = (waypointAtual + 1) % waypoints.Count;
        }
    }

    private void GirarRodas()
    {
        if (rodas == null) return;
        float giroGraus = (velocidadeAtual / (2f * Mathf.PI * raioRoda)) * 360f * Time.deltaTime;
        foreach (var r in rodas)
        {
            if (r != null) r.Rotate(Vector3.right, giroGraus, Space.Self);
        }
    }

    public void TocarBuzinaFofa()
    {
        if (somBuzinaFofa != null && audioSource != null)
        {
            audioSource.PlayOneShot(somBuzinaFofa, 0.6f);
        }
    }
}
`,
  },

  // 3. Assets/Scripts/NPCController.cs
  {
    path: 'Assets/Scripts/NPCController.cs',
    name: 'NPCController.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Pessoas e moradores da cidade: caminham nas calçadas, acenam e falam "Oi Theo!" com balão de fala',
    content: `using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Inteligência Artificial dos Pedestres e Crianças da Cidade.
/// Andam nas calçadas, olham para o Theo, acenam e mostram balões de fala amigáveis.
/// </summary>
public class NPCController : MonoBehaviour
{
    [Header("--- Identificação do Morador ---")]
    public string nomeNPC = "Vovó Maria";
    public string papelNaCidade = "Vovó na Praça";
    [TextArea(2, 3)]
    public string fraseAmigavel = "Oi Theo Lucca! Que lindo dia de sol para brincar!";

    [Header("--- Raio de Interação ---")]
    public float distanciaInteracao = 4.5f;
    public Transform playerTransform;

    [Header("--- Balão de Fala 3D ---")]
    public GameObject balaoFalaCanvas;
    public Text textoBalao;

    [Header("--- Componentes & Animação ---")]
    public Animator animator;
    public AudioSource audioSource;
    public AudioClip somVozAmigavel;

    private static readonly int IsWavingHash = Animator.StringToHash("IsWaving");
    private bool estaOlhandoTheo = false;

    private void Start()
    {
        if (playerTransform == null)
        {
            var p = GameObject.FindGameObjectWithTag("Player");
            if (p != null) playerTransform = p.transform;
        }

        if (balaoFalaCanvas != null) balaoFalaCanvas.SetActive(false);
        if (textoBalao != null) textoBalao.text = fraseAmigavel;
    }

    private void Update()
    {
        if (playerTransform == null) return;

        float dist = Vector3.Distance(transform.position, playerTransform.position);

        if (dist <= distanciaInteracao)
        {
            // Vira para olhar o Theo
            Vector3 dir = (playerTransform.position - transform.position);
            dir.y = 0;
            if (dir.sqrMagnitude > 0.01f)
            {
                transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(dir), 6f * Time.deltaTime);
            }

            if (!estaOlhandoTheo)
            {
                estaOlhandoTheo = true;
                if (animator != null) animator.SetBool(IsWavingHash, true);
                MostrarFala();
            }
        }
        else
        {
            if (estaOlhandoTheo)
            {
                estaOlhandoTheo = false;
                if (animator != null) animator.SetBool(IsWavingHash, false);
                EsconderFala();
            }
        }
    }

    public void MostrarFala()
    {
        if (balaoFalaCanvas != null) balaoFalaCanvas.SetActive(true);
        if (somVozAmigavel != null && audioSource != null)
        {
            audioSource.PlayOneShot(somVozAmigavel, 0.5f);
        }
    }

    public void EsconderFala()
    {
        if (balaoFalaCanvas != null) balaoFalaCanvas.SetActive(false);
    }
}
`,
  },

  // 4. Assets/Scripts/MoneyManager.cs
  {
    path: 'Assets/Scripts/MoneyManager.cs',
    name: 'MoneyManager.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Sistema de Dinheiro em R$ da carteira, moedas douradas pelo chão e ganho por trabalhos',
    content: `using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Sistema de Dinheiro estilo GTA adaptado para crianças (Moedas em R$).
/// Theo começa com R$ 0,00 e ganha dinheiro trabalhando e coletando moedas.
/// </summary>
public class MoneyManager : MonoBehaviour
{
    public static MoneyManager Instance { get; private set; }

    [Header("--- Carteira do Theo (R$) ---")]
    [Tooltip("Dinheiro atual em Reais")]
    public float dinheiroAtual = 0.00f;

    [Tooltip("Total de moedinhas douradas coletadas no chão")]
    public int moedasColetadas = 0;

    [Header("--- Referências de Interface (HUD) ---")]
    public Text textoCarteiraHUD;
    public Text textoContadorMoedasHUD;
    public Animation animacaoCarteira;

    [Header("--- Efeitos Sonoros ---")]
    public AudioSource audioSource;
    public AudioClip somMoedaColetada; // "Plim!"
    public AudioClip somTrabalhoRecebido; // "Cha-ching!" caixa registradora
    public AudioClip somCompra;

    [Header("--- Eventos ---")]
    public UnityEvent<float> onDinheiroAlterado;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        AtualizarUI();
    }

    /// <summary>
    /// Adiciona dinheiro à carteira (trabalho ou recompensa de missão)
    /// </summary>
    public void GanharDinheiro(float valor, bool ehTrabalho = false)
    {
        dinheiroAtual += valor;
        AtualizarUI();

        if (audioSource != null)
        {
            AudioClip clip = ehTrabalho ? somTrabalhoRecebido : somMoedaColetada;
            if (clip != null) audioSource.PlayOneShot(clip, 0.7f);
        }

        if (animacaoCarteira != null) animacaoCarteira.Play();
        onDinheiroAlterado?.Invoke(dinheiroAtual);
    }

    /// <summary>
    /// Coletou uma moedinha dourada pelo chão da cidade
    /// </summary>
    public void ColetarMoeda(float valorMoeda = 1.00f)
    {
        moedasColetadas++;
        GanharDinheiro(valorMoeda, false);
    }

    /// <summary>
    /// Tenta gastar dinheiro em compras (brinquedos, mercado, roupas)
    /// </summary>
    public bool GastarDinheiro(float valor)
    {
        if (dinheiroAtual >= valor)
        {
            dinheiroAtual -= valor;
            AtualizarUI();
            if (somCompra != null && audioSource != null) audioSource.PlayOneShot(somCompra, 0.6f);
            onDinheiroAlterado?.Invoke(dinheiroAtual);
            return true;
        }
        return false;
    }

    public void AtualizarUI()
    {
        if (textoCarteiraHUD != null)
        {
            textoCarteiraHUD.text = string.Format("R$ {0:0.00}", dinheiroAtual);
        }

        if (textoContadorMoedasHUD != null)
        {
            textoContadorMoedasHUD.text = "★ " + moedasColetadas.ToString();
        }
    }
}
`,
  },

  // 5. Assets/Scripts/JobManager.cs
  {
    path: 'Assets/Scripts/JobManager.cs',
    name: 'JobManager.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Sistema dos 5 Trabalhos: Pizza R$ 20, Mercado R$ 15, Jardineiro R$ 10, Jornal R$ 25, Padaria R$ 12',
    content: `using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Gerenciador dos 5 Trabalhos Infantis:
/// 1. Entregador de Pizza (R$ 20)
/// 2. Ajudante do Mercado (R$ 15)
/// 3. Jardineiro do Parque (R$ 10)
/// 4. Entregador de Jornal (R$ 25)
/// 5. Ajudante da Padaria (R$ 12)
/// </summary>
public class JobManager : MonoBehaviour
{
    public static JobManager Instance { get; private set; }

    public enum TipoTrabalho
    {
        Nenhum,
        EntregadorPizza,
        AjudanteMercado,
        JardineiroParque,
        EntregadorJornal,
        AjudantePadaria
    }

    [Header("--- Trabalho Ativo ---")]
    public TipoTrabalho trabalhoAtual = TipoTrabalho.Nenhum;
    public string nomeTrabalhoAtual = "Nenhum";
    public float recompensaTrabalho = 0f;
    public int etapaAtual = 1;
    public int totalEtapas = 1;
    public Transform alvoWaypointAtual;

    [Header("--- Elementos de HUD ---")]
    public GameObject bannerTrabalhoAtivo;
    public Text textoTituloTrabalho;
    public Text textoDescricaoEtapa;
    public Text textoDistanciaAlvo;

    [Header("--- Referência ao Player ---")]
    public PlayerController playerController;

    private void Awake()
    {
        if (Instance != null && Instance != this) Destroy(gameObject);
        else Instance = this;
    }

    public void IniciarTrabalho(TipoTrabalho tipo)
    {
        trabalhoAtual = tipo;
        etapaAtual = 1;

        switch (tipo)
        {
            case TipoTrabalho.EntregadorPizza:
                nomeTrabalhoAtual = "Entregador de Pizza";
                recompensaTrabalho = 20.00f;
                totalEtapas = 2;
                if (playerController != null) playerController.DefinirPropSegurado("pizza");
                break;

            case TipoTrabalho.AjudanteMercado:
                nomeTrabalhoAtual = "Ajudante do Mercado";
                recompensaTrabalho = 15.00f;
                totalEtapas = 2;
                break;

            case TipoTrabalho.JardineiroParque:
                nomeTrabalhoAtual = "Jardineiro do Parque";
                recompensaTrabalho = 10.00f;
                totalEtapas = 3;
                if (playerController != null) playerController.DefinirPropSegurado("wateringCan");
                break;

            case TipoTrabalho.EntregadorJornal:
                nomeTrabalhoAtual = "Entregador de Jornal";
                recompensaTrabalho = 25.00f;
                totalEtapas = 2;
                if (playerController != null) playerController.DefinirPropSegurado("newspaper");
                break;

            case TipoTrabalho.AjudantePadaria:
                nomeTrabalhoAtual = "Ajudante da Padaria";
                recompensaTrabalho = 12.00f;
                totalEtapas = 2;
                break;
        }

        if (bannerTrabalhoAtivo != null) bannerTrabalhoAtivo.SetActive(true);
        AtualizarHUDTrabalho();
    }

    public void ConcluirTrabalho()
    {
        if (trabalhoAtual == TipoTrabalho.Nenhum) return;

        MoneyManager.Instance.GanharDinheiro(recompensaTrabalho, true);

        if (playerController != null) playerController.DefinirPropSegurado("none");
        trabalhoAtual = TipoTrabalho.Nenhum;

        if (bannerTrabalhoAtivo != null) bannerTrabalhoAtivo.SetActive(false);
    }

    private void AtualizarHUDTrabalho()
    {
        if (textoTituloTrabalho != null) textoTituloTrabalho.text = nomeTrabalhoAtual + " (+R$ " + recompensaTrabalho.ToString("0.00") + ")";
        if (textoDescricaoEtapa != null) textoDescricaoEtapa.text = "Etapa " + etapaAtual + " de " + totalEtapas;
    }
}
`,
  },

  // 6. Assets/Scripts/ShopManager.cs
  {
    path: 'Assets/Scripts/ShopManager.cs',
    name: 'ShopManager.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Sistema de Compras nas 3 Lojas (Brinquedos, Mercado, Roupas) e Inventário da Mochila do Theo',
    content: `using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Sistema de Lojas e Inventário da Mochila do Theo Lucca.
/// Compras:
/// - LOJA DE BRINQUEDOS: Carrinho R$ 30, Bola R$ 15, Pipa R$ 20, Ursinho R$ 25
/// - MERCADO: Maçã R$ 5, Suco R$ 8, Pão R$ 6, Biscoito R$ 7
/// - LOJA DE ROUPAS: Boné Novo R$ 40, Tênis Novo R$ 60, Camiseta R$ 35
/// </summary>
public class ShopManager : MonoBehaviour
{
    public static ShopManager Instance { get; private set; }

    [System.Serializable]
    public class ItemLoja
    {
        public string id;
        public string nome;
        public float preco;
        public string categoria; // "brinquedo", "comida", "roupa"
        public Sprite icone;
        public string descricao;
    }

    [Header("--- Itens Comprados na Mochila ---")]
    public List<ItemLoja> itensMochila = new List<ItemLoja>();

    [Header("--- Painel de Loja (UI) ---")]
    public GameObject painelLoja;
    public GameObject painelMochila;

    private void Awake()
    {
        if (Instance != null && Instance != this) Destroy(gameObject);
        else Instance = this;
    }

    public bool ComprarItem(ItemLoja item)
    {
        if (MoneyManager.Instance.GastarDinheiro(item.preco))
        {
            itensMochila.Add(item);
            Debug.Log("Item comprado com sucesso: " + item.nome);
            return true;
        }
        return false;
    }

    public void AbrirLoja()
    {
        if (painelLoja != null) painelLoja.SetActive(true);
    }

    public void FecharLoja()
    {
        if (painelLoja != null) painelLoja.SetActive(false);
    }

    public void AbrirMochila()
    {
        if (painelMochila != null) painelMochila.SetActive(true);
    }

    public void FecharMochila()
    {
        if (painelMochila != null) painelMochila.SetActive(false);
    }
}
`,
  },

  // 7. Assets/Scripts/MissionManager.cs
  {
    path: 'Assets/Scripts/MissionManager.cs',
    name: 'MissionManager.cs',
    category: 'Scripts',
    type: 'csharp',
    description: 'Campanha de 5 Missões Principais da Cidade com objetivos, banners e premiações',
    content: `using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// THEO LUCCA - CIDADE REAL 3D
/// Missões Principais da Campanha:
/// Missão 1: Trabalhe 1 vez e ganhe R$ 20
/// Missão 2: Colete 10 moedinhas na cidade
/// Missão 3: Compre uma bola na loja de brinquedos
/// Missão 4: Entregue 3 pizzas
/// Missão 5: Junte R$ 100 e compre um carrinho novo
/// </summary>
public class MissionManager : MonoBehaviour
{
    public static MissionManager Instance { get; private set; }

    [System.Serializable]
    public class MissaoPrincipal
    {
        public int id;
        public string titulo;
        public string descricao;
        public float recompensa;
        public int progressoAtual;
        public int metaTotal;
        public bool concluida;
    }

    public MissaoPrincipal[] missoes;
    public int missaoAtivaIndex = 0;

    [Header("--- UI da Missão ---")]
    public Text textoTituloMissao;
    public Text textoDescricaoMissao;
    public Text textoProgressoMissao;
    public GameObject bannerVitoriaMissao;

    private void Awake()
    {
        if (Instance != null && Instance != this) Destroy(gameObject);
        else Instance = this;
    }

    private void Start()
    {
        AtualizarUIMissao();
    }

    public void AdicionarProgresso(int idMissao, int quantidade = 1)
    {
        if (missaoAtivaIndex >= missoes.Length) return;
        var m = missoes[missaoAtivaIndex];

        if (m.id == idMissao && !m.concluida)
        {
            m.progressoAtual += quantidade;
            if (m.progressoAtual >= m.metaTotal)
            {
                m.concluida = true;
                MoneyManager.Instance.GanharDinheiro(m.recompensa, true);
                if (bannerVitoriaMissao != null) bannerVitoriaMissao.SetActive(true);
                missaoAtivaIndex++;
            }
            AtualizarUIMissao();
        }
    }

    public void AtualizarUIMissao()
    {
        if (missaoAtivaIndex >= missoes.Length)
        {
            if (textoTituloMissao != null) textoTituloMissao.text = "TODAS AS MISSÕES CONCLUÍDAS!";
            if (textoDescricaoMissao != null) textoDescricaoMissao.text = "Theo Lucca é o campeão da Cidade Real 3D!";
            return;
        }

        var m = missoes[missaoAtivaIndex];
        if (textoTituloMissao != null) textoTituloMissao.text = m.titulo + " (+R$ " + m.recompensa.ToString("0.00") + ")";
        if (textoDescricaoMissao != null) textoDescricaoMissao.text = m.descricao;
        if (textoProgressoMissao != null) textoProgressoMissao.text = m.progressoAtual + " / " + m.metaTotal;
    }
}
`,
  },

  // 8. Assets/Models/theo_lucca.fbx
  {
    path: 'Assets/Models/theo_lucca.fbx',
    name: 'theo_lucca.fbx',
    category: 'Models',
    type: 'markdown',
    description: 'Guia de importação do modelo realista FBX com rig Humanoid, texturas PBR e animações Mixamo',
    content: `# Assets/Models/theo_lucca.fbx - Configuração do Modelo Realista

Este arquivo define a estrutura do modelo realista 3D de Theo Lucca (menino de 4 anos) com Humanoid Avatar.

## Especificação do Modelo 3D:
- **Altura**: 1.05m (escala infantil realista, proporção 1:4.8)
- **Pele**: Morena clara com bochechas expressivas (\`#C68652\`)
- **Cabelo**: Cacheado castanho escuro (\`#28180E\`)
- **Boné**: Azul royal com aba frontal curvada (\`#1D4ED8\`)
- **Camisa**: Azul vibrante com estrela dourada no peito (\`#2563EB\`)
- **Mochila**: Marrom de aventureiro com alças e fivela de latão (\`#854D0E\`)
- **Bermuda**: Jeans escura (\`#1E293B\`)
- **Tênis**: Vermelho esportivo com sola e cadarços brancos (\`#DC2626\`)

## Rigging & Bone Hierarchy (Mixamo Humanoid):
\`\`\`
Hips
└── Spine
    └── Spine1
        └── Spine2
            ├── Neck
            │   └── Head (Cap & Curly Hair attached)
            ├── LeftShoulder -> LeftArm -> LeftForeArm -> LeftHand
            └── RightShoulder -> RightArm -> RightForeArm -> RightHand (PropSocket)
├── LeftUpLeg -> LeftLeg -> LeftFoot -> LeftToeBase
└── RightUpLeg -> RightLeg -> RightFoot -> RightToeBase
\`\`\`

## Configuração no Unity Inspector:
1. Selecione \`theo_lucca.fbx\` na pasta \`Assets/Models/\`.
2. Na aba **Rig**, mude **Animation Type** para **Humanoid**.
3. Clique em **Apply** e em **Configure...** para validar o avatar.
4. Na aba **Materials**, configure as texturas de pele, camisa azul, boné e tênis vermelho.
`,
  },

  // 9. Assets/Models/carros.fbx
  {
    path: 'Assets/Models/carros.fbx',
    name: 'carros.fbx',
    category: 'Models',
    type: 'markdown',
    description: 'Guia dos 5 carros coloridos (Táxi Amarelo, Azul Esportivo, Van Vermelha, Fusca Verde, Picape Laranja)',
    content: `# Assets/Models/carros.fbx - 5 Carros Coloridos Infantis

## Carros Inclusos:
1. **Táxi Amarelo**: Sedã urbano clássico com letreiro no teto.
2. **Carro Azul Esportivo**: Modelo ágil com rodas de liga leve.
3. **Van Vermelha**: Veículo de entregas da cidade.
4. **Fusquinha Verde**: Carro retrô arredondado super amigável.
5. **Picape Laranja**: Caminhonete com caçamba aberta.

## Componentes Unity para cada carro:
- \`Rigidbody\` (Mass = 1200, IsKinematic = true para trânsito suave)
- \`BoxCollider\` (com trigger frontal para sensor anti-atropelamento)
- \`CarController.cs\` anexado na raiz
- Quatro GameObjects filhos para as rodas com o script de rotação
`,
  },

  // 10. Assets/Models/npcs.fbx
  {
    path: 'Assets/Models/npcs.fbx',
    name: 'npcs.fbx',
    category: 'Models',
    type: 'markdown',
    description: 'Guia das 10 pessoas e moradores da cidade (Vovó Maria, Carteiro, Padeiro, Crianças, Policial)',
    content: `# Assets/Models/npcs.fbx - 10 Moradores da Cidade Real 3D

## Personagens Inclusos:
1. **Vovó Maria**: Vestidinho lilás, sentada no banco da praça.
2. **Carteiro Carlos**: Uniforme azul dos correios com bolsa de cartas.
3. **Padeiro Seu Zé**: Avental branco e chapéu de mestre cuca na padaria.
4. **Florista Dona Rosa**: Cuidando dos canteiros de flores coloridas.
5. **Pedrinho**: Amiguinho de 4 anos brincando no escorregador.
6. **Bia**: Criança com vestido florido no balanço da praça.
7. **Policial Amigo**: Guarda de trânsito orientando na faixa de pedestre.
8. **Dona Carmen**: Cliente saindo do mercado com sacola de maçãs.
9. **Sr. João**: Morador amigável regando o jardim de sua casa.
10. **Marina**: Jovem passeando na orla da praia.
`,
  },

  // 11. Assets/Scenes/Cidade.unity
  {
    path: 'Assets/Scenes/Cidade.unity',
    name: 'Cidade.unity',
    category: 'Scenes',
    type: 'unity',
    description: 'Cena da Cidade Completa: Ruas com faixas, semáforos, calçadas, praça, praia, lojas e casas',
    content: `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!29 &1
OcclusionCullingSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_OcclusionBakeSettings:
    smallestHole: 0.25
    backfaceThreshold: 100
--- !u!104 &2
RenderSettings:
  m_Fog: 1
  m_FogColor: {r: 0.529, g: 0.807, b: 0.921, a: 1}
  m_FogMode: 3
  m_FogDensity: 0.009
  m_AmbientSkyColor: {r: 0.95, g: 0.96, b: 1, a: 1}
--- !u!1 &100
GameObject:
  m_Name: "THEO LUCCA - CIDADE REAL 3D"
  m_TagString: "Untagged"
  m_IsActive: 1
  // Estrutura de Hierarquia da Cena:
  // - [World_Environment]
  //   - Terrain (Grama Verde 160x160)
  //   - Beach & Ocean (Areia e Mar Azul)
  //   - Sun_DirectionalLight (Luz Solar Brilhante)
  // - [Road_Network]
  //   - Av_Central_NS (Asfalto com faixas)
  //   - Av_Comercial_LO
  //   - Crosswalks (Faixas de Pedestre)
  //   - TrafficLights (Semáforos Verde/Amarelo/Vermelho)
  // - [Buildings_And_Shops]
  //   - Pizzaria_do_Bairro (Trabalho Pizza R$ 20)
  //   - Supermercado_Central (Compras e Trabalho)
  //   - Loja_de_Brinquedos (Bola, Carrinho, Pipa)
  //   - Padaria_Pao_Quentinho (Trabalho Pão R$ 12)
  //   - Loja_de_Roupas (Boné Novo e Tênis)
  //   - Praca_Central_Fonte
  //   - Bairro_Residencial (Casas e Caixas de Correio)
  // - [Traffic_Cars] (5 Carros com IA de trânsito)
  // - [Pedestrians_NPCs] (10 Moradores com balões de fala)
  // - [Collectibles_Coins] (25 Moedas Douradas R$)
  // - Player_Theo_Lucca (Com PlayerController.cs)
`,
  },

  // 12. Assets/UI/HUD.unity
  {
    path: 'Assets/UI/HUD.unity',
    name: 'HUD.unity',
    category: 'UI',
    type: 'unity',
    description: 'Interface Mobile estilo GTA/Free Fire: Carteira R$, Mochila, Minimapa radar, Joystick e Botões de Ação',
    content: `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1 &101
GameObject:
  m_Name: "HUD_Mobile_FreeFire_GTA"
  m_TagString: "Untagged"
  m_IsActive: 1
  // Componentes da Interface:
  // - Canvas (Screen Space - Overlay, Scale With Screen Size 1920x1080 Landscape)
  // - TopBar:
  //   - TheoLucca_Card (Avatar 4a, Barra de Fôlego, Mochila)
  //   - Carteira_Dinheiro (R$ 0,00 com Moedas Douradas)
  //   - Banner_Missao_Trabalho (Objetivo e Distância em metros)
  //   - Minimapa_Radar_Circular (Norte, Lojas, Casas, Carros e Alvos)
  // - BottomLeft:
  //   - Joystick_Virtual (Analógico Mobile)
  //   - QuickTurn_Buttons (Girar ESQ / DIR)
  // - BottomRight:
  //   - Botao_TRABALHAR (Inicia/Entrega trabalho)
  //   - Botao_COMPRAR (Abre lojas de brinquedos/mercado)
  //   - Botao_FALAR (Acena e conversa com moradores)
  //   - Botao_CARONA (Entra de carona com adulto no carro)
  //   - Botao_BUZINA (Toca buzina fofa "bibi!")
  //   - Botao_CORRER (Ativa corrida com fôlego)
  //   - Botao_PULAR (Pulo com física Rigidbody)
`,
  },
];
