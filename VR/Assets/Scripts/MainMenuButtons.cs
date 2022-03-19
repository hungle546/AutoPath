using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
public class MainMenuButtons : MonoBehaviour
{
    public void StartClicked()
    {
        Debug.Log("start button clicked");
    }

    public void AlgorClicked()
    {
        Debug.Log("algorithm button clicked");
        SceneManager.LoadScene(1);

    }

    public void SettingClicked()
    {
        Debug.Log("settings Clicked");
    }
}


