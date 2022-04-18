using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GridScript : MonoBehaviour
{
    public LayerMask _obstacle;
    public float node_radius;
    public Transform player;
    public GameObject effect;
    public List<Node> path;
    public MazeRender maze_Size;

    private Node[,] grid;
    private float node_diameter;
    private int grid_size_x;
    private int grid_size_y;
    [SerializeField]
    private float pl_speed = 20f;
    private void Start()
    {
        node_diameter = node_radius * 2;
        grid_size_x = Mathf.RoundToInt(maze_Size.width / node_diameter);
        grid_size_y = Mathf.RoundToInt(maze_Size.height / node_diameter);
        CreateGrid();

    }
    void CreateGrid()
    {
        grid = new Node[grid_size_x, grid_size_y];
        Vector3 grid_bottom_left = transform.position - Vector3.right * maze_Size.width / 2 - Vector3.forward * maze_Size.height / 2;

        for (int x = 0; x < grid_size_x; x++)
        {
            for (int y = 0; y < grid_size_y; y++)
            {
                Vector3 world_point = grid_bottom_left + Vector3.right * (x * node_diameter + node_radius) + Vector3.forward * (y * node_diameter + node_radius);
                bool walkable = !(Physics.CheckSphere(world_point, node_radius, _obstacle));
                grid[x, y] = new Node(walkable, world_point, x,y);
            }
        }
    }
    public List<Node> GetNeighbours(Node node)
    {
        List<Node> neighbours = new List<Node>();

        for (int x = -1; x <= 1; x++)
        {
            for (int y = -1; y <= 1; y++)
            {
                if (x == 0 && y == 0)
                    continue;
                int check_x = node.grid_x + x;
                int check_y = node.grid_y + y;

                if(check_x >= 0 && check_x < grid_size_x && check_y >= 0 && check_y < grid_size_y)
                {
                    neighbours.Add(grid[check_x, check_y]); 
                }
            }
        }
        return neighbours;
    }
    public Node NodeFromWoldPoint(Vector3 world_pos)
    {
        float percentageX = (world_pos.x + maze_Size.width / 2) / maze_Size.width;
        float percentageY = (world_pos.z + maze_Size.height / 2) / maze_Size.height;
        percentageX = Mathf.Clamp01(percentageX);
        percentageY = Mathf.Clamp01(percentageY);

        int x = Mathf.RoundToInt((grid_size_x - 1) * percentageX);
        int y = Mathf.RoundToInt((grid_size_y - 1) * percentageY);

        return grid[x, y]; 
        
    }
    private void Update()
    {
        if (Input.GetKey(KeyCode.Space)) 
        {
            instansion();
        }
        if (Input.GetKey(KeyCode.C))
        {
            GetToDestination();
        }

    }
    private void OnDrawGizmos()
    {
        Gizmos.DrawWireCube(transform.position, new Vector3(maze_Size.width, 0.2f, maze_Size.height));

        if (grid != null)
        {
            Node player_node = NodeFromWoldPoint(player.position);
            foreach (Node n in grid)
            {
                Gizmos.color = (n.walkable) ? Color.white : Color.red;
                
                if (player_node == n)
                {
                    Gizmos.color = Color.magenta;
                }
                if(path != null)
                {
                    if (path.Contains(n))
                    {
                        Gizmos.color = Color.cyan;
                        GameObject instance = (GameObject) Instantiate(effect, n.world_position, Quaternion.identity);
                        Destroy(instance, 1f );
                    }
                }
                Gizmos.DrawWireCube(n.world_position, Vector3.one * (node_diameter - 0.1f));
            }
        }

    }
    void instansion()
    {
        if (grid != null)
        {
            Node player_node = NodeFromWoldPoint(player.position);
            foreach (Node n in grid)
            {
                

                if (player_node == n)
                {
                    
                }
                if (path != null)
                {
                    if (path.Contains(n))
                    {
                        
                        GameObject instance = (GameObject)Instantiate(effect, n.world_position, Quaternion.identity);
                        Destroy(instance, 1f);
                    }
                }
                
            }
        }
    }
    void GetToDestination()
    {
        Node p_node; 
        if (grid != null)
        {
            Node player_node = NodeFromWoldPoint(player.position);
            foreach (Node n in grid)
            {


                if (player_node == n)
                {
                    p_node = n;
                }
                if (path != null)
                {
                    if (path.Contains(n))
                    {

                        GameObject.FindGameObjectWithTag("Player").transform.position = Vector3.Lerp(GameObject.FindGameObjectWithTag("Player").transform.position, new Vector3(n.world_position.x, GameObject.FindGameObjectWithTag("Player").transform.position.y, n.world_position.z),  pl_speed * Time.deltaTime);
                    }
                }

            }
        }
    }
}
