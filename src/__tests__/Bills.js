/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH,ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toEqual('active-icon')

    })

    //---------Added code--------------
    test("When I click on the eye icon should display a modal with the image",()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      document.body.innerHTML = BillsUI({data:[bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const store = null

      const billsFn = new Bills({document, onNavigate, store, localStorage: window.localStorage})
      
      const handleClickIconEye = jest.fn((icon)=> billsFn.handleClickIconEye(icon))
      $.fn.modal = jest.fn((action) => {
        if (action === 'show') {
          console.log('Modal opened');
        }
      });

      const eye = screen.getByTestId('icon-eye')

      eye.addEventListener('click', (e)=>{
        handleClickIconEye(e.target)
        })
      userEvent.click(eye)

      expect(handleClickIconEye).toHaveBeenCalled()
    })

    test("When I click on the 'Nouvelle note de frais' button the 'handleClickNewBill() function should be triggered'",()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({data:[bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      const store = null
      const billsFn = new Bills({document, onNavigate, store, localStorage: window.localStorage}) 
      const handleClickNewBill = jest.fn(billsFn.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')

      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)

      expect(handleClickNewBill).toHaveBeenCalled()
    })

    test("When I call the 'getBills() function with the mocked store the length of bills array should be 4",async ()=>{
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
 
      const billsFn = new Bills({document, onNavigate, store:mockStore, localStorage: window.localStorage}) 
      const getBillsFn = jest.fn(function(){
        return billsFn.getBills()
      })

      const getBills = await getBillsFn()

      expect(getBills.length).toBe(4)
    })
    //---------Finished added code----------------

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const pageTitle  = await screen.getByText("Mes notes de frais")
      const newBillButton  = await screen.getByText("Nouvelle note de frais")

      expect(pageTitle).toBeTruthy()
      expect(newBillButton).toBeTruthy()

      const billType = await screen.getAllByText("Type")
      const billNom = await screen.getAllByText("Nom")
      const billDate = await screen.getAllByText("Date")
      const billMontant = await screen.getAllByText("Montant")
      const billStatut = await screen.getAllByText("Statut")
      const billActions = await screen.getAllByText("Actions")

      expect(billType[0]).toBeTruthy()
      expect(billNom[0]).toBeTruthy()
      expect(billDate[0]).toBeTruthy()
      expect(billMontant[0]).toBeTruthy()
      expect(billStatut[0]).toBeTruthy()
      expect(billActions[0]).toBeTruthy()

      const pendingBills = await screen.getAllByTestId("tbody")
      expect(pendingBills[0].children.length).not.toBe(0)

      const eye = screen.getAllByTestId("icon-eye")
      expect(eye[0]).toBeTruthy()
    })
 describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window,'localStorage',{ value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee',email: "a@a"}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {list : () =>  {return Promise.reject(new Error("Erreur 404"))}}
      })

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);

    const message = await screen.getByText(/Erreur 404/)//Page not found
    expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500")) //Internal server error
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  }) 

  })
})

